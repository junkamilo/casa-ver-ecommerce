import { NextRequest, NextResponse } from "next/server";
import {
  BunnyUploadConfigError,
  BunnyUploadValidationError,
  cleanupTempChunks,
} from "@/modules/adminCatalog/upload/application/upload-media.use-case";
import { runAdminRoute } from "@/server/http/admin-route";
import { toErrorResponse } from "@/server/http/error-response";

export const runtime = "nodejs";

/**
 * POST /api/admin/upload/abort
 * Body JSON: { uploadId, totalChunks }
 */
export async function POST(request: NextRequest) {
  return runAdminRoute(async () => {
    try {
      const body = (await request.json()) as {
        uploadId?: string;
        totalChunks?: number;
      };

      if (!body.uploadId || typeof body.totalChunks !== "number") {
        return NextResponse.json(
          { error: "uploadId y totalChunks son requeridos" },
          { status: 400 },
        );
      }

      const result = await cleanupTempChunks({
        uploadId: body.uploadId,
        totalChunks: body.totalChunks,
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
