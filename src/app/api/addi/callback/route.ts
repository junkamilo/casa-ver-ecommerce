import { NextRequest, NextResponse } from "next/server";
import { processAddiCallbackUseCase } from "@/modules/payments/addi/application/process-addi-callback.use-case";
import { toErrorResponse } from "@/server/http/error-response";

// ---------------------------------------------------------------------------
// POST /api/addi/callback?key=...
//
// Thin handler. Toda la lógica del callback vive en
// modules/payments/addi/application/process-addi-callback.use-case.ts.
//
// Errores específicos:
//   - AddiUnauthorizedError → 401 (clave inválida)
//   - AddiValidationError   → 400 (orderId/status/applicationId inválidos)
//   - "Error interno"       → 500 (markOrderPaid falló — Addi reintentará)
// El resto retorna 200 (incluso monto insuficiente: el problema no es
// transitorio, hay que investigar manualmente vía WebhookLog).
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const providedKey = new URL(req.url).searchParams.get("key");

  try {
    const result = await processAddiCallbackUseCase({ payload, providedKey });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorRes = toErrorResponse(error);
    const errorPayload = await errorRes.json();
    return NextResponse.json(
      { error: errorPayload.message ?? "Error" },
      { status: errorRes.status }
    );
  }
}
