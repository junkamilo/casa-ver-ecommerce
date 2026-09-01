import { NextRequest, NextResponse } from "next/server";
import {
  BunnyUploadConfigError,
  BunnyUploadValidationError,
  getDirectChunkUploadCredentialsUseCase,
} from "@/modules/adminCatalog/upload/application/upload-media.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

export const runtime = "nodejs";

/**
 * POST /api/admin/upload/direct-credentials
 * Body JSON: { uploadId }
 * Returns Bunny storage credentials scoped to casa-verde/_tmp/{uploadId} for direct chunk PUT.
 */
export async function POST(request: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const body = (await request.json()) as { uploadId?: string };
      if (!body.uploadId) {
        return NextResponse.json({ error: "uploadId requerido" }, { status: 400 });
      }

      const credentials = await getDirectChunkUploadCredentialsUseCase({
        uploadId: body.uploadId,
      });

      return NextResponse.json(credentials, {
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
