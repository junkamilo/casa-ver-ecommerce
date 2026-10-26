import { prisma } from "@/lib/prisma";
import { isOrderWithinPaymentGrace } from "@/modules/checkout/domain/order-payment-grace";
import { parsePosLineId } from "@/modules/posIntegration/domain/pos-mapper";
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
  //   4. Por cada item: si existe ProductVariant → decrementar stock y reserved.
  //      (ProductItemVariant ya descontó stock al crear la orden — no se toca)
  //   5. Crear notificación de admin "Pedido pagado".
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

      // IMPORTANTE: los ítems de un conjunto (isSet) usan ProductItemVariant
      // (sin campo `reserved`), mientras que los productos normales usan
      // ProductVariant (con `stock` y `reserved`). Probamos primero
      // ProductVariant; si no existe, asumimos ProductItemVariant y NO
      // decrementamos de nuevo (ya se descontó al crear la orden).
      // Ítems con el SKU del POS como variantId: no tienen reserva en la web; el POS descuenta su
      // inventario al registrar la venta (postOrder).
      for (const item of order.items) {
        if (parsePosLineId(item.variantId)) continue;
        const productVariant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { id: true },
        });

        if (productVariant) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: { decrement: item.quantity },
              reserved: { decrement: item.quantity },
            },
          });
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (tx as any).adminNotification.create({
        data: {
          orderId: updatedOrder.id,
          title: `Pedido pagado · ${updatedOrder.orderNumber}`,
          body: `${updatedOrder.user?.name ?? "Cliente"} · ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(updatedOrder.total))}`,
        },
      });

      return { order: updatedOrder as PaidOrderDTO, newlyPaid: true };
    });
  }

  // -------------------------------------------------------------------------
  // releaseStockByTransactionId
  //
  // Libera reservas de stock cuando el pago falla, se cancela o se reembolsa
  // (el cupón no se consumió: el POS solo registra el uso de pedidos pagados). Idempotente: si la orden no existe o ya está en estado terminal
  // (no PENDING/PROCESSING), no hace nada.
  //
  // Pasos dentro de la transacción:
  //   1. Buscar orden + items.
  //   2. Si no existe o no está PENDING/PROCESSING → return.
  //   3. Update status (+ cancelledAt si CANCELLED).
  //   4. Por cada item: ProductVariant → decrement reserved (clamp);
  //      ProductItemVariant → increment stock (re-poner lo descontado al crear).
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
  ): Promise<void> {
    try {
      await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { transactionId },
          include: { items: true },
        });

        if (!order) {
          console.warn(`[releaseOrderStock] Orden no encontrada: ${transactionId}`);
          return;
        }

        // Idempotencia: solo actuar sobre órdenes aún en estado transitorio
        if (!["PENDING", "PROCESSING"].includes(order.status)) {
          console.log(
            `[releaseOrderStock] Orden ${order.orderNumber} ya en estado ${order.status} — sin acción`
          );
          return;
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            status: newStatus as any,
            ...(newStatus === "CANCELLED" ? { cancelledAt: new Date() } : {}),
          },
        });

        for (const item of order.items) {
          // Ítem del POS (SKU como variantId): no se reservó nada en la web.
          if (parsePosLineId(item.variantId)) continue;
          const productVariant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { id: true, reserved: true },
          });

          if (productVariant) {
            // Producto normal: solo tenía reserva (reserved), nunca se descontó stock físico
            const safeDecrement = Math.min(item.quantity, productVariant.reserved);
            if (safeDecrement > 0) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { reserved: { decrement: safeDecrement } },
              });
            }
          } else {
            // ProductItemVariant (conjunto): el stock fue descontado en createOrder
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (tx as any).productItemVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }

        console.log(
          `[releaseOrderStock] ✓ Stock liberado — orden ${order.orderNumber} → ${newStatus}`
        );
      });
    } catch (err) {
      // No relanzar — el estado de la orden ya fue actualizado antes de este
      // punto en los webhooks; los webhooks NO deben fallar por esto.
      console.error(
        "[releaseOrderStock] Error liberando stock:",
        err instanceof Error ? err.message : err
      );
    }
  }
}
