import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// GET /api/payments/bold/pse-banks
// Proxy → GET https://api.online.payments.bold.co/v1/payment/pse/banks
// Cachea 1 hora (la lista de bancos no cambia frecuentemente).
// ---------------------------------------------------------------------------
export async function GET() {
  const apiKey =
    process.env.BOLD_IDENTITY_KEY ?? process.env.NEXT_PUBLIC_BOLD_IDENTITY_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Pasarela no configurada" }, { status: 500 });
  }

  const res = await fetch(
    "https://api.online.payments.bold.co/v1/payment/pse/banks",
    {
      headers: { Authorization: `x-api-key ${apiKey}` },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    console.error("[BOLD PSE banks] Error:", res.status);
    return NextResponse.json(
      { error: "Error obteniendo lista de bancos PSE" },
      { status: 502 }
    );
  }

  const data = await res.json();
  // La respuesta de Bold viene en { payload: { banks: [...] } }
  return NextResponse.json(data?.payload?.banks ?? data?.banks ?? []);
}
