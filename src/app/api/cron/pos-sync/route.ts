import { NextResponse } from "next/server";
import { runPosFullSync } from "@/modules/posIntegration/application/full-sync.use-case";
import { isPosCatalogConfigured } from "@/modules/posIntegration/infrastructure/pos-catalog.client";

export const maxDuration = 300;

function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isPosCatalogConfigured()) {
    return NextResponse.json({ error: "Integración POS no configurada" }, { status: 503 });
  }

  try {
    const result = await runPosFullSync();
    console.log("[Cron/PosSync]", JSON.stringify({ ...result, errors: result.errors.length }));
    if (result.errors.length > 0) console.warn("[Cron/PosSync] Errores:", result.errors);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Cron/PosSync] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error sincronizando con el POS" },
      { status: 502 },
    );
  }
}
