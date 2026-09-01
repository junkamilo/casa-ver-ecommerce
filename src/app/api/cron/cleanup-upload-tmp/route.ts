import { NextResponse } from "next/server";
import { cleanupStaleTempUploadsUseCase } from "@/modules/adminCatalog/upload/application/upload-media.use-case";

function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await cleanupStaleTempUploadsUseCase();
    console.info("[cron cleanup-upload-tmp]", result);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron cleanup-upload-tmp] failed", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cleanup failed" },
      { status: 500 },
    );
  }
}
