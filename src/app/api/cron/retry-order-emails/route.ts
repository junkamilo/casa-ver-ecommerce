/**
 * Reintenta emails de confirmación para órdenes PAID que nunca lo recibieron.
 *
 * Cron: cada 15 minutos (ver vercel.json)
 * Seguridad: Authorization: Bearer ${CRON_SECRET}
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyOrderConfirmation } from "@/modules/payments/shared/infrastructure/order-confirmation.notifier";

function verifyCronSecret(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

  const orders = await prisma.order.findMany({
    where: {
      status: "PAID",
      confirmationEmailSentAt: null,
      paidAt: { lt: twoMinutesAgo },
    },
    include: { items: true, user: true },
    orderBy: { paidAt: "asc" },
    take: 25,
  });

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const order of orders) {
    if (!order.user?.email) {
      skipped++;
      continue;
    }

    try {
      await notifyOrderConfirmation(order, { skipIfAlreadySent: true });

      const updated = await prisma.order.findUnique({
        where: { id: order.id },
        select: { confirmationEmailSentAt: true, confirmationEmailError: true },
      });

      if (updated?.confirmationEmailSentAt) {
        sent++;
        console.log(`[Cron/RetryEmail] ✓ ${order.orderNumber} → ${order.user.email}`);
      } else {
        failed++;
        console.warn(
          `[Cron/RetryEmail] ✗ ${order.orderNumber}: ${updated?.confirmationEmailError ?? "sin envío"}`
        );
      }
    } catch (err) {
      failed++;
      console.error(
        `[Cron/RetryEmail] Error ${order.orderNumber}:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  const summary = {
    checked: orders.length,
    sent,
    failed,
    skipped,
  };

  console.log("[Cron/RetryEmail]", summary);
  return NextResponse.json(summary);
}
