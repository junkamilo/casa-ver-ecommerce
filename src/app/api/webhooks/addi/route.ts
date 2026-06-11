import { NextRequest, NextResponse } from "next/server";
import { processAddiWebhookUseCase } from "@/modules/payments/addi/application/process-addi-webhook.use-case";
import { toErrorResponse } from "@/server/http/error-response";

// ---------------------------------------------------------------------------
// POST /api/webhooks/addi
//
// Thin handler. Toda la lógica vive en
// modules/payments/addi/application/process-addi-webhook.use-case.ts.
//
// Addi envía la firma en "x-addi-signature" o "x-signature".
// El procesamiento es síncrono (a diferencia de Bold) — Addi tolera
// tiempos de respuesta razonables.
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  let rawBody: string;
  let payload: Record<string, unknown>;

  try {
    rawBody = await req.text();
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const signatureHeader =
    req.headers.get("x-addi-signature") ?? req.headers.get("x-signature") ?? "";

  try {
    await processAddiWebhookUseCase({ rawBody, payload, signatureHeader });
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const errorRes = toErrorResponse(error);
    const errorPayload = await errorRes.json();
    return NextResponse.json(
      { error: errorPayload.message ?? "Error" },
      { status: errorRes.status }
    );
  }
}
