import { prisma } from "@/lib/prisma";
import { isOrderWithinPaymentGrace } from "@/modules/checkout/domain/order-payment-grace";
import { OrderPaymentGraceExpiredError } from "../application/order.errors";
import type { PaidOrderDTO, ReleaseOrderTargetStatus } from "../contracts/order-payment.dto";

export type MarkPaidResult = {
  order: PaidOrderDTO;
  newlyPaid: boolean;
};

// Encapsula las dos transacciones atómicas críticas del dominio de órdenes:
// markPaid y releaseStock. Mantiene la misma estructura y comportamiento que
// la implementación original en src/app/actions/checkout.ts — incluida la
// idempotencia y el orden exacto de operaciones dentro de la transacción.
export class PrismaOrderRepository {
  // -------------------------------------------------------------------------
  // markPaidByTransactionId
  //
  // Marca una orden como PAID atómicamente. Idempotente: si ya está PAID
  // retorna la orden sin cambios.
  //
  // Pasos dentro de la transacción:
  //   1. Buscar la orden por transactionId (con items + user).
  //   2. Si ya está PAID → return.
  //   3. Update status=PAID, paymentId, paidAt.
  //
  // El inventario no se toca en la web: el POS consume la reserva del pedido y descuenta el stock al
  // registrar la venta (reportPaidOrderToPos).
  //
  // El uso del cupón no se registra aquí: lo registra el POS (sales.promotion_redemptions) cuando la web
  // le reporta el pedido pagado (reportPaidOrderToPos), y lo revierte si se anula.
  // -------------------------------------------------------------------------
  async markPaidByTransactionId(
    transactionId: string,
    paymentId: string
  ): Promise<MarkPaidResult> {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { transactionId },
        include: { items: true, user: true },
      });

      if (!order) {
        throw new Error(`Orden no encontrada: ${transactionId}`);
      }
      if (order.status === "PAID") {
        return { order: order as PaidOrderDTO, newlyPaid: false };
      }

      if (
        order.status === "PENDING" &&
        !isOrderWithinPaymentGrace(order.paymentExpiresAt)
      ) {
        throw new OrderPaymentGraceExpiredError();
      }

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: "PAID", paymentId, paidAt: new Date() },
        include: { items: true, user: true },
      });

      return { order: updatedOrder as PaidOrderDTO, newlyPaid: true };
    });
  }

  // -------------------------------------------------------------------------
  // releaseStockByTransactionId
  //
  // Cierra un pedido sin pagar cuando el pago falla, se cancela o se reembolsa (el cupón no se consumió:
  // el POS solo registra el uso de pedidos pagados). Idempotente: si la orden no existe o ya está en
  // estado terminal (no PENDING/PROCESSING), no hace nada. Devuelve el número del pedido cerrado para
  // soltar su reserva en el POS (null si no cambió nada).
  // -------------------------------------------------------------------------
  // -------------------------------------------------------------------------
  // markPaidOrderRefundedByTransactionId
  //
  // La pasarela reembolsó un pedido YA pagado (Bold VOID_APPROVED). releaseStock no actúa sobre
  // pedidos pagados, así que aquí se pasa a REFUNDED. Idempotente: solo cambia pedidos pagados.
  // Devuelve true si cambió el estado.
  // -------------------------------------------------------------------------
  async markPaidOrderRefundedByTransactionId(transactionId: string): Promise<boolean> {
    const result = await prisma.order.updateMany({
      where: { transactionId, status: { in: ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] } },
      data: { status: "REFUNDED", cancelledAt: new Date() },
    });
    return result.count > 0;
  }

  async releaseStockByTransactionId(
    transactionId: string,
    newStatus: ReleaseOrderTargetStatus,
  ): Promise<string | null> {
    try {
      return await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { transactionId },
          select: { id: true, orderNumber: true, status: true },
        });

        if (!order) {
          console.warn(`[releaseOrderStock] Orden no encontrada: ${transactionId}`);
          return null;
        }

        // Idempotencia: solo actuar sobre órdenes aún en estado transitorio
        if (!["PENDING", "PROCESSING"].includes(order.status)) {
          console.log(
            `[releaseOrderStock] Orden ${order.orderNumber} ya en estado ${order.status} — sin acción`
          );
          return null;
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            status: newStatus as any,
            ...(newStatus === "CANCELLED" ? { cancelledAt: new Date() } : {}),
          },
        });

        console.log(
          `[releaseOrderStock] ✓ Orden ${order.orderNumber} → ${newStatus}`
        );
        return order.orderNumber;
      });
    } catch (err) {
      // No relanzar — el estado de la orden ya fue actualizado antes de este
      // punto en los webhooks; los webhooks NO deben fallar por esto.
      console.error(
        "[releaseOrderStock] Error cerrando la orden:",
        err instanceof Error ? err.message : err
      );
      return null;
    }
  }
}
