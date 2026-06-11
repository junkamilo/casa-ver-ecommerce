import { NextRequest, NextResponse } from "next/server";
import { verifyBoldPaymentUseCase } from "@/modules/payments/bold/application/verify-bold-payment.use-case";
import { toErrorResponse } from "@/server/http/error-response";

// ---------------------------------------------------------------------------
// GET /api/payments/bold/verify?reference_id=...
//
// Bold redirige al cliente a /pago/resultado?reference_id={transactionId}.
// Esta ruta es un thin handler — toda la lógica vive en
// modules/payments/bold/application/verify-bold-payment.use-case.ts.
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const referenceId = req.nextUrl.searchParams.get("reference_id");
  if (!referenceId) {
    return NextResponse.json({ error: "reference_id requerido" }, { status: 400 });
  }

  try {
    const result = await verifyBoldPaymentUseCase({ referenceId });
    return NextResponse.json(result);
  } catch (error) {
    const errorRes = toErrorResponse(error);
    const payload = await errorRes.json();
    return NextResponse.json(
      { error: payload.message ?? "Error" },
      { status: errorRes.status }
    );
  }
}
