import { NextRequest, NextResponse } from "next/server";
import {
  BunnyUploadConfigError,
  BunnyUploadValidationError,
  initChunkedUploadUseCase,
} from "@/modules/adminCatalog/upload/application/upload-media.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

export const runtime = "nodejs";

/**
 * POST /api/admin/upload/init
 * Body JSON: { fileName, contentType, fileSize, folder?, resourceType? }
 */
export async function POST(request: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const body = (await request.json()) as {
        fileName?: string;
        contentType?: string;
        fileSize?: number;
        folder?: string;
        resourceType?: "image" | "video";
        heroVariant?: "desktop" | "tablet" | "mobile";
        heroProcessed?: boolean;
      };

      if (!body.fileName || !body.contentType || typeof body.fileSize !== "number") {
        return NextResponse.json(
          { error: "fileName, contentType y fileSize son requeridos" },
          { status: 400 }
        );
      }

      const result = await initChunkedUploadUseCase({
        fileName: body.fileName,
        contentType: body.contentType,
        fileSize: body.fileSize,
        folder: body.folder,
        resourceType: body.resourceType,
        heroVariant: body.heroVariant,
        heroProcessed: body.heroProcessed,
      });

      return NextResponse.json(result, {
        headers: { "Cache-Control": "no-store" },
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
