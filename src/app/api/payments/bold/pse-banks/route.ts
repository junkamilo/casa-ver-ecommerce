import { NextResponse } from "next/server";
import { listPseBanksUseCase } from "@/modules/payments/bold/application/list-pse-banks.use-case";
import { toErrorResponse } from "@/server/http/error-response";

// ---------------------------------------------------------------------------
// GET /api/payments/bold/pse-banks
// Proxy a Bold PSE banks. Cachea 1 hora vía revalidate del cliente HTTP.
//
// NOTA: Hoy ningún archivo del frontend consume este endpoint
// (verificado con búsqueda). Se conserva por compatibilidad y se marca como
// candidato a unificar con /api/payments/pse-banks en otra PR futura.
// ---------------------------------------------------------------------------
export async function GET() {
  try {
    const banks = await listPseBanksUseCase({ apiKey: process.env.BOLD_IDENTITY_KEY });
    // Shape original: array directo
    return NextResponse.json(banks);
  } catch (error) {
    const errorRes = toErrorResponse(error);
    const payload = await errorRes.json();
    return NextResponse.json(
      { error: payload.message ?? "Error" },
      { status: errorRes.status }
    );
  }
}
