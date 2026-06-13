import { prisma } from "@/lib/prisma";
import { notifyOrderConfirmation } from "@/modules/payments/shared/infrastructure/order-confirmation.notifier";

export type RetryOrderEmailsResult = {
  checked: number;
  sent: number;
  failed: number;
  skipped: number;
};

/**
 * Reintenta confirmaciones para órdenes PAID sin email enviado.
 * Pensado para ejecutarse 1 vez/día (plan Hobby de Vercel) o bajo demanda.
 */
export async function retryPendingOrderConfirmationEmails(
  options?: { minAgeMs?: number; limit?: number }
): Promise<RetryOrderEmailsResult> {
  const minAgeMs = options?.minAgeMs ?? 2 * 60 * 1000;
  const limit = options?.limit ?? 25;
  const cutoff = new Date(Date.now() - minAgeMs);

  const orders = await prisma.order.findMany({
    where: {
      status: "PAID",
      confirmationEmailSentAt: null,
      paidAt: { lt: cutoff },
    },
    include: { items: true, user: true },
    orderBy: { paidAt: "asc" },
    take: limit,
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
        console.log(`[RetryEmail] ✓ ${order.orderNumber} → ${order.user.email}`);
      } else {
        failed++;
        console.warn(
          `[RetryEmail] ✗ ${order.orderNumber}: ${updated?.confirmationEmailError ?? "sin envío"}`
        );
      }
    } catch (err) {
      failed++;
      console.error(
        `[RetryEmail] Error ${order.orderNumber}:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  return { checked: orders.length, sent, failed, skipped };
}
