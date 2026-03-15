import { NextResponse } from "next/server";

const BOLD_API_BASE = "https://api.online.payments.bold.co";

// ---------------------------------------------------------------------------
// GET /api/payments/pse-banks
//
// Retorna la lista de bancos disponibles para PSE.
// Cacheado 1 hora — la lista no cambia frecuentemente.
// ---------------------------------------------------------------------------
export async function GET() {
  const apiKey = process.env.BOLD_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "BOLD_API_KEY no configurada" },
      { status: 500 }
    );
  }

  const res = await fetch(`${BOLD_API_BASE}/v1/payment/pse/banks`, {
    headers: { Authorization: `x-api-key ${apiKey}` },
    next: { revalidate: 3600 }, // cache 1 hora
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[PSE Banks] Error Bold API:", res.status, body.slice(0, 200));
    return NextResponse.json(
      { error: "Error obteniendo bancos PSE" },
      { status: 502 }
    );
  }

  const data = await res.json();
  // Bold retorna un array directamente o un objeto con `financial_institutions`
  const banks = Array.isArray(data)
    ? data
    : (data.financial_institutions ?? data.banks ?? []);

  return NextResponse.json({ banks });
}
