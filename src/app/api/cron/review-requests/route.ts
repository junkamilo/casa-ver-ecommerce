import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReviewRequestEmail } from "@/services/email/client";
import { isPosCatalogConfigured, listPosOrders } from "@/modules/posIntegration/infrastructure/pos-catalog.client";
import { requestReviewLink } from "@/modules/posIntegration/infrastructure/pos-reviews.client";

// Envía solicitudes de reseña 7 días después de la entrega. El enlace (token de un solo uso, 30 días) lo emite
// el POS, donde vive la reseña y se modera (md/COMPARACION-TABLAS-RESENAS-POS-vs-WEB.md); la web solo manda el correo.
const DAYS_AFTER_DELIVERY = 7;
const MS = DAYS_AFTER_DELIVERY * 24 * 60 * 60 * 1000;
/** Ventas de los últimos días que se revisan en el POS (las más viejas ya recibieron su solicitud). */
const LOOKBACK_DAYS = 60;
const MAX_PAGES = 5;

function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - MS);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://casaverdeoficial.com";

  // La entrega la registra el POS (Tienda → Pedidos): pedidos entregados hace ≥ 7 días.
  if (!isPosCatalogConfigured()) {
    return NextResponse.json({ error: "Integración POS no configurada" }, { status: 503 });
  }
  const from = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" })
    .format(new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000));
  const delivered: string[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const result = await listPosOrders({
      fulfillmentStatuses: ["DELIVERED"],
      deliveredBefore: cutoff.toISOString(),
      from,
      page,
      size: 100,
    });
    delivered.push(...result.items.map((o) => o.orderNumber));
    if (result.items.length < 100) break;
  }

  // De esos, los que aún no recibieron la solicitud de reseña.
  const orders = await prisma.order.findMany({
    where: {
      orderNumber:              { in: delivered },
      reviewRequestEmailSentAt: null,
      user: {
        email: { not: null },
      },
    },
    include: {
      user:  { select: { email: true, name: true } },
      items: {
        take: 1,
        orderBy: { id: "asc" },
      },
    },
    orderBy: { paidAt: "asc" },
    take: 50,
  });

  let sent = 0;
  let failed = 0;

  for (const order of orders) {
    if (!order.user.email) continue;
    const firstItem = order.items[0];
    if (!firstItem) continue;

    // OrderItem.productId es el slug del producto. Si ya la reseñó, no se vuelve a pedir.
    const link = await requestReviewLink({
      orderNumber: order.orderNumber,
      productSlug: firstItem.productId,
      productName: firstItem.name,
    }).catch((error: unknown) => ({
      ok: false as const,
      status: 503,
      message: error instanceof Error ? error.message : "POS sin respuesta",
    }));
    if (!link.ok) {
      if (link.status === 409) {
        await prisma.order.update({ where: { id: order.id }, data: { reviewRequestEmailSentAt: new Date() } });
      } else {
        failed++;
        console.error(`[Cron/ReviewRequests] El POS no emitió el enlace de ${order.orderNumber}:`, link.message);
      }
      continue;
    }
    const token = link.data.token;

    const reviewUrl = `${baseUrl}/resenas?token=${token}`;

    const result = await sendReviewRequestEmail({
      customerEmail:   order.user.email,
      customerName:    order.user.name || order.shippingName,
      productName:     firstItem.name,
      productImageUrl: firstItem.imageUrl,
      orderNumber:     order.orderNumber,
      reviewUrl,
    });

    if (result.success) {
      await prisma.order.update({
        where: { id: order.id },
        data:  { reviewRequestEmailSentAt: new Date() },
      });
      sent++;
    } else {
      // El enlace sigue vigente en el POS: el próximo intento reenvía el mismo.
      failed++;
      console.error(`[Cron/ReviewRequests] Error para orden ${order.orderNumber}:`, result.error);
    }
  }

  console.log(`[Cron/ReviewRequests] Procesadas: ${orders.length}, enviadas: ${sent}, fallidas: ${failed}`);
  return NextResponse.json({ processed: orders.length, sent, failed });
}
