import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PEDIDOS_PATH } from "@/app/perfil/constants/pedidos-route";
import { sendAbandonedCheckoutEmail } from "@/services/email/client";

// Órdenes PENDING sin pagar por más de 1 hora
const ABANDONED_AFTER_MS = 60 * 60 * 1000;

function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - ABANDONED_AFTER_MS);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://casaverdeoficial.com";

  const pendingOrders = await prisma.order.findMany({
    where: {
      status:                      "PENDING",
      createdAt:                   { lt: cutoff },
      abandonedCheckoutEmailSentAt: null,
      user: {
        email:         { not: null },
        emailVerified: { not: null },
      },
    },
    include: {
      user:  { select: { email: true, name: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  let sent = 0;
  let failed = 0;

  for (const order of pendingOrders) {
    if (!order.user.email) continue;

    // URL de pago: usar boldLinkId si existe, si no la página de pedidos
    const paymentUrl = order.boldLinkId
      ? `${baseUrl}/checkout/pago?linkId=${order.boldLinkId}`
      : `${baseUrl}${PEDIDOS_PATH}`;

    const result = await sendAbandonedCheckoutEmail({
      customerEmail: order.user.email,
      customerName:  order.user.name || order.shippingName,
      orderNumber:   order.orderNumber,
      items: order.items.map((i) => ({
        name:     i.name,
        price:    Number(i.price),
        imageUrl: i.imageUrl,
        color:    i.colorName,
        size:     i.size,
      })),
      total:      Number(order.total),
      paymentUrl,
    });

    if (result.success) {
      await prisma.order.update({
        where: { id: order.id },
        data:  { abandonedCheckoutEmailSentAt: new Date() },
      });
      sent++;
    } else {
      failed++;
      console.error(`[Cron/AbandonedCheckout] Error para orden ${order.orderNumber}:`, result.error);
    }
  }

  console.log(`[Cron/AbandonedCheckout] Procesados: ${pendingOrders.length}, enviados: ${sent}, fallidos: ${failed}`);
  return NextResponse.json({ processed: pendingOrders.length, sent, failed });
}
