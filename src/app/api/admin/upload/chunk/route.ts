import { NextRequest, NextResponse } from "next/server";
import {
  BunnyUploadConfigError,
  BunnyUploadValidationError,
  uploadChunkPartUseCase,
} from "@/modules/adminCatalog/upload/application/upload-media.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/admin/upload/chunk
 * multipart: uploadId, index, chunk
 */
export async function POST(request: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const formData = await request.formData();
      const uploadId = formData.get("uploadId");
      const indexRaw = formData.get("index");
      const chunk = formData.get("chunk");

      if (typeof uploadId !== "string" || typeof indexRaw !== "string") {
        return NextResponse.json(
          { error: "uploadId e index son requeridos" },
          { status: 400 }
        );
      }
      if (!(chunk instanceof File)) {
        return NextResponse.json({ error: "chunk requerido" }, { status: 400 });
      }

      const index = Number(indexRaw);
      const result = await uploadChunkPartUseCase({ uploadId, index, chunk });

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
