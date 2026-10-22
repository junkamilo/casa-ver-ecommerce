import { NextRequest, NextResponse, after } from "next/server";
import { receivePosWebhook } from "@/modules/posIntegration/application/receive-pos-webhook.use-case";

// El POS reintenta hasta recibir 2xx y espera como máximo 5 s: se responde apenas el aviso queda
// verificado y registrado, y la re-consulta a la API del POS corre en `after()`.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return NextResponse.json({ error: "Cannot read body" }, { status: 400 });
  }

  try {
    const result = await receivePosWebhook({
      rawBody,
      headers: {
        timestamp: req.headers.get("x-casaverde-timestamp"),
        signature: req.headers.get("x-casaverde-signature"),
        eventId: req.headers.get("x-casaverde-event-id"),
        event: req.headers.get("x-casaverde-event"),
      },
    });

    if (result.background) after(result.background);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("[POS WEBHOOK] Error inesperado:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
