import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { processEmailJob } from "@/lib/email-queue";
import type { EmailJob } from "@/lib/email-queue";

export async function POST(req: NextRequest) {
  const body = await req.text();

  // Verificar firma de QStash (solo si las keys están configuradas)
  const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY;

  if (currentKey && nextKey) {
    const receiver = new Receiver({ currentSigningKey: currentKey, nextSigningKey: nextKey });
    try {
      const valid = await receiver.verify({
        signature: req.headers.get("upstash-signature") ?? "",
        body,
        url: req.url,
      });
      if (!valid) {
        return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ error: "Verificación de firma fallida" }, { status: 401 });
    }
  }

  try {
    const job = JSON.parse(body) as EmailJob;
    await processEmailJob(job);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Queue/Email]", err instanceof Error ? err.message : err);
    // Retornar 200 para que QStash no reintente errores permanentes (payload inválido)
    return NextResponse.json({ error: "Error procesando job" }, { status: 200 });
  }
}
