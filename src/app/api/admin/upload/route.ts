import { NextRequest, NextResponse } from "next/server";
import {
  BunnyUploadConfigError,
  BunnyUploadValidationError,
  uploadMediaUseCase,
} from "@/modules/adminCatalog/upload/application/upload-media.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/admin/upload
 *
 * Proxy admin → Bunny Storage (solo archivos pequeños, ~<3.5 MB).
 * Videos / archivos grandes deben usar /api/admin/upload/{init,chunk,complete}
 * porque Vercel rechaza bodies > ~4.5 MB con HTTP 413.
 *
 * Body: multipart/form-data
 *   - file: File (requerido)
 *   - folder?: products | categories | heroes | sets
 *   - resourceType?: image | video
 *
 * Response: { url, objectKey }
 */
export async function POST(request: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const contentLength = Number(request.headers.get("content-length") || "0");
      if (contentLength > 4_200_000) {
        return NextResponse.json(
          {
            error:
              "Archivo demasiado grande para este endpoint (límite Vercel ~4.5 MB). Usa subida por partes.",
          },
          { status: 413 }
        );
      }

      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });
      }

      const folderRaw = formData.get("folder");
      const resourceTypeRaw = formData.get("resourceType");

      const folder = typeof folderRaw === "string" ? folderRaw : undefined;
      const resourceType =
        resourceTypeRaw === "image" || resourceTypeRaw === "video"
          ? resourceTypeRaw
          : undefined;

      const heroVariantRaw = formData.get("heroVariant");
      const heroProcessedRaw = formData.get("heroProcessed");
      const heroVariant =
        typeof heroVariantRaw === "string" &&
        (heroVariantRaw === "desktop" ||
          heroVariantRaw === "tablet" ||
          heroVariantRaw === "mobile")
          ? heroVariantRaw
          : undefined;
      const heroProcessed = heroProcessedRaw === "true";

      const result = await uploadMediaUseCase({
        file,
        folder,
        resourceType,
        heroVariant,
        heroProcessed,
      });

      return NextResponse.json(result, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
      });
    } catch (error) {
      if (error instanceof BunnyUploadConfigError) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (error instanceof BunnyUploadValidationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return toErrorResponse(error);
    }
  });
}
