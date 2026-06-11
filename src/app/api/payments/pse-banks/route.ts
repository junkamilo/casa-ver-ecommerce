import { NextResponse } from "next/server";
import { listPseBanksUseCase } from "@/modules/payments/bold/application/list-pse-banks.use-case";
import { toErrorResponse } from "@/server/http/error-response";

// ---------------------------------------------------------------------------
// GET /api/payments/pse-banks
//
// Misma data que /api/payments/bold/pse-banks pero con shape histórico
// distinto: { banks: [...] }. Se conserva por compatibilidad — actualmente
// no es consumido por ningún archivo del frontend.
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const banks = await listPseBanksUseCase({ apiKey: process.env.BOLD_API_KEY });
    return NextResponse.json({ banks });
  } catch (error) {
    const errorRes = toErrorResponse(error);
    const payload = await errorRes.json();
    return NextResponse.json(
      { error: payload.message ?? "Error" },
      { status: errorRes.status }
    );
  }
}
