import { prisma } from "@/lib/prisma";
import {
  hasUserExceededCouponLimit,
  isPromotionalCoupon,
  PROMOTIONAL_MAX_USES_PER_USER,
} from "@/modules/checkout/domain/coupon.entity";
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
  //   4. Por cada item: si existe ProductVariant → decrementar stock y reserved.
  //      (ProductItemVariant ya descontó stock al crear la orden — no se toca)
  //   5. Crear notificación de admin "Pedido pagado".
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
        await this.consolidatePromotionalCouponUsage(tx, order);
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
      for (const item of order.items) {
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

      await this.consolidatePromotionalCouponUsage(tx, updatedOrder);

      return { order: updatedOrder as PaidOrderDTO, newlyPaid: true };
    });
  }

  private async consolidatePromotionalCouponUsage(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx: any,
    order: {
      id: string;
      appliedCouponId: string | null;
      userId: string;
      user: { email: string | null } | null;
      shippingCedula: string | null;
    }
  ): Promise<void> {
    // Flash Sale grace: NO revalidar validFrom/validTo del cupón aquí.
    // La ventana temporal se congela al crear la orden; el webhook honra el
    // snapshot aunque validTo ya haya pasado mientras la orden esté en grace.
    if (!order.appliedCouponId) return;

    const coupon = await tx.coupon.findUnique({
      where: { id: order.appliedCouponId },
      select: {
        id: true,
        kind: true,
        maxUsesPerUser: true,
        maxGlobalUses: true,
      },
    });

    if (!coupon || !isPromotionalCoupon(coupon.kind)) return;

    const existingUsage = await tx.couponUsage.findUnique({
      where: { orderId: order.id },
    });
    if (existingUsage) return;

    const email = (order.user?.email ?? "").toLowerCase().trim();
    const documentId = (order.shippingCedula ?? "").trim();
    if (!email || !documentId) {
      console.warn(
        `[markPaid] Orden ${order.id} con cupón promocional sin email/cédula — omitiendo consolidación`
      );
      return;
    }

    const previousUsageCount = await tx.couponUsage.count({
      where: {
        couponId: coupon.id,
        OR: [
          { email },
          { documentId },
          { userId: order.userId },
        ],
      },
    });

    if (
      hasUserExceededCouponLimit(previousUsageCount, PROMOTIONAL_MAX_USES_PER_USER)
    ) {
      console.warn(
        `[markPaid] Cupón ${coupon.id} ya usado por usuario de orden ${order.id} — omitiendo consolidación`
      );
      return;
    }

    const incremented = await tx.$executeRaw`
      UPDATE "coupons"
      SET "currentGlobalUses" = "currentGlobalUses" + 1
      WHERE "id" = ${coupon.id}
        AND "currentGlobalUses" < ${coupon.maxGlobalUses ?? 0}
    `;

    if (Number(incremented) === 0) {
      console.warn(
        `[markPaid] Cupón ${coupon.id} agotado al consolidar orden ${order.id}`
      );
      return;
    }

    await tx.couponUsage.create({
      data: {
        couponId: coupon.id,
        orderId: order.id,
        userId: order.userId,
        email,
        documentId,
      },
    });
  }

  // -------------------------------------------------------------------------
  // releaseStockByTransactionId
  //
  // Libera reservas de stock + cupón cuando el pago falla, se cancela o se
  // reembolsa. Idempotente: si la orden no existe o ya está en estado terminal
  // (no PENDING/PROCESSING), no hace nada.
  //
  // Pasos dentro de la transacción:
  //   1. Buscar orden + items.
  //   2. Si no existe o no está PENDING/PROCESSING → return.
  //   3. Update status (+ cancelledAt si CANCELLED).
  //   4. Por cada item: ProductVariant → decrement reserved (clamp);
  //      ProductItemVariant → increment stock (re-poner lo descontado al crear).
  //   5. Liberar cupón si la orden lo tenía reservado.
  // -------------------------------------------------------------------------
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

        // Liberar cupón si aplica (para que el usuario pueda reintentarlo)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (tx as any).coupon.updateMany({
          where: {
            usedByOrderId: order.id,
            isUsed: true,
          },
          data: {
            isUsed: false,
            usedAt: null,
            usedByOrderId: null,
          },
        });

        console.log(
          `[releaseOrderStock] ✓ Stock y cupón liberados — orden ${order.orderNumber} → ${newStatus}`
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
