import { NextRequest, NextResponse } from "next/server";
import {
  BunnyUploadConfigError,
  BunnyUploadValidationError,
  uploadMediaUseCase,
} from "@/modules/adminCatalog/upload/application/upload-media.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

export const runtime = "nodejs";

/**
 * POST /api/admin/upload
 *
 * Proxy admin → Bunny Storage.
 * El AccessKey nunca se expone al cliente.
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

      const result = await uploadMediaUseCase({ file, folder, resourceType });

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
