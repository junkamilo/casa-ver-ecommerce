import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { markOrderPaid } from "@/app/actions/checkout";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // MP envía topic=payment y data.id con el ID del pago
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ received: true });
    }

    const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!mpAccessToken) {
      console.error("[MP Webhook] MERCADOPAGO_ACCESS_TOKEN no configurado");
      return NextResponse.json({ error: "config" }, { status: 500 });
    }

    const mp = new MercadoPagoConfig({ accessToken: mpAccessToken });
    const paymentClient = new Payment(mp);
    const payment = await paymentClient.get({ id: body.data.id });

    if (payment.status !== "approved") {
      return NextResponse.json({ received: true });
    }

    const transactionId = payment.external_reference;
    if (!transactionId) {
      console.error("[MP Webhook] external_reference vacío para pago", body.data.id);
      return NextResponse.json({ error: "no external_reference" }, { status: 400 });
    }

    await markOrderPaid(transactionId, String(body.data.id));

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[MP Webhook] Error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
