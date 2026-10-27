import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { quoteShippingForAddress } from "@/modules/shipping/application/pos-shipping";
import { applyFreeShipping } from "@/modules/shipping/domain/resolve-shipping-price";
import { computeOrderPaymentExpiresAt } from "../domain/order-payment-grace";
import { quoteCouponWithPos, type CouponQuote } from "./pos-coupon";
import { resolvePosLinePrices } from "./pos-line-prices";
import { parsePosLineId } from "@/modules/posIntegration/domain/pos-mapper";
import {
  CouponAlreadyUsedError,
  CouponExhaustedError,
  CouponExpiredError,
  CouponInactiveError,
  CouponNotApplicableError,
  CouponNotYetValidError,
  InvalidAddressError,
} from "../application/checkout.errors";
import type { CreateOrderInputDTO } from "../contracts/create-order.dto";

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CV-${timestamp}-${random}`;
}

export interface CreatedOrderRecord {
  order: { id: string; orderNumber: string; transactionId: string };
}

/** Cupón rechazado por el POS → error del checkout con el mensaje del POS. */
export function couponRejection(reason: string, message: string): Error {
  switch (reason) {
    case "COUPON_ALREADY_USED":
      return new CouponAlreadyUsedError(message);
    case "COUPON_EXHAUSTED":
      return new CouponExhaustedError(message);
    case "COUPON_EXPIRED":
      return new CouponExpiredError(message);
    case "COUPON_NOT_YET_VALID":
      return new CouponNotYetValidError(message);
    case "COUPON_NOT_FOUND":
    case "COUPON_INACTIVE":
    case "CHANNEL_NOT_ALLOWED":
      return new CouponInactiveError(message);
    default:
      return new CouponNotApplicableError(message);
  }
}

// ---------------------------------------------------------------------------
// PrismaCheckoutRepository
//
// Encapsula la transacción atómica completa de creación de orden.
// ---------------------------------------------------------------------------
export class PrismaCheckoutRepository {
  /**
   * `orderNumber`: lo genera quien llama para reservar antes el inventario en el POS con ese número (el POS
   * consume la reserva cuando el pedido pagado llega con el mismo número).
   */
  async createOrderTransaction(input: CreateOrderInputDTO, orderNumber: string): Promise<CreatedOrderRecord> {
    // Envío: tarifa, cobertura y condiciones de envío gratis las da el POS (red ANTES del $transaction).
    // El envío gratis se aplica sobre el subtotal neto con las condiciones que publicó el POS.
    let shippingQuote;
    try {
      shippingQuote = await quoteShippingForAddress({ city: input.city, department: input.department, subtotalNeto: 0 });
    } catch (error) {
      console.error("[checkout] El POS no cotizó el envío:", error);
      throw new InvalidAddressError("No pudimos calcular el envío. Intenta de nuevo en unos segundos.");
    }
    if (!shippingQuote.ok || shippingQuote.baseCost == null) {
      throw new InvalidAddressError("No hay cobertura para esta dirección");
    }

    const shippingBaseCost = shippingQuote.baseCost;
    const shippingRateName = shippingQuote.rateName;
    const shippingTerms = {
      freeShippingThreshold: shippingQuote.freeShippingThreshold,
      freeShippingActive: shippingQuote.freeShippingActive,
    };

    // Precio de cada ítem (SKU del POS como variantId), consultado al POS. El inventario ya quedó apartado
    // en el POS para este pedido (reservePosStockForOrder) y se descuenta al registrar la venta pagada.
    const realPriceMap = await resolvePosLinePrices(input.items);

    // El pedido identifica el producto por su slug del POS (reseñas, prueba social).
    const productSlugOf = (item: { productId: string; variantId: string }) =>
      parsePosLineId(item.variantId)?.slug ?? item.productId;

    // Cupón: lo valida el POS con los precios reales (red ANTES del $transaction). El POS calcula el
    // descuento y su reparto por línea; la web no lo recalcula.
    let couponQuote: Extract<CouponQuote, { valid: true }> | null = null;
    const quotedPrices: number[] = [];
    if (input.couponCode?.trim()) {
      for (const item of input.items) {
        quotedPrices.push(realPriceMap.get(item.variantId) ?? item.price);
      }
      const quote = await quoteCouponWithPos({
        code: input.couponCode,
        email: input.email,
        document: input.cedula,
        lines: input.items.map((item, index) => ({
          variantId: item.variantId,
          productId: item.productId,
          price: quotedPrices[index],
          quantity: item.quantity,
        })),
      });
      if (!quote.valid) throw couponRejection(quote.reason, quote.message);
      couponQuote = quote;
    }

    return prisma.$transaction(
      async (tx) => {
        // 1. Buscar o crear usuario guest/registrado
        let user = await tx.user.findUnique({ where: { email: input.email.toLowerCase() } });
        if (!user) {
          user = await tx.user.create({
            data: {
              email: input.email.toLowerCase(),
              name: `${input.firstName} ${input.lastName}`,
              phone: input.phone,
            },
          });
        }

        const realSubtotal = input.items.reduce(
          (sum, item) =>
            sum + (realPriceMap.get(item.variantId) ?? item.price) * item.quantity,
          0
        );

        // 2. Cupón validado por el POS: se aplica solo si los precios no cambiaron desde la validación.
        let couponDiscountAmount = 0;
        if (couponQuote) {
          const changed = input.items.some(
            (item, index) => (realPriceMap.get(item.variantId) ?? item.price) !== quotedPrices[index]
          );
          if (changed) {
            throw new CouponNotApplicableError(
              "El precio de un producto cambió mientras pagabas. Vuelve a aplicar el cupón."
            );
          }
          couponDiscountAmount = Math.min(couponQuote.discountAmount, realSubtotal);
        }

        const finalDiscount = couponDiscountAmount;
        const netSubtotal = realSubtotal - finalDiscount;
        const realShippingCost = applyFreeShipping(shippingBaseCost, netSubtotal, shippingTerms);
        const realTotal = realSubtotal + realShippingCost - finalDiscount;

        const transactionId = randomUUID();
        const paymentExpiresAt = computeOrderPaymentExpiresAt();

        if (input.savedAddressId) {
          const addrOwner = await tx.address.findUnique({
            where: { id: input.savedAddressId },
            select: { userId: true },
          });
          if (!addrOwner || addrOwner.userId !== user.id) {
            throw new InvalidAddressError("Dirección de envío inválida");
          }
        }

        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: user.id,
            transactionId,
            ...(input.savedAddressId ? { addressId: input.savedAddressId } : {}),
            shippingName: `${input.firstName} ${input.lastName}`,
            shippingAddress: `${input.address}${input.addressDetail ? `, ${input.addressDetail}` : ""}`,
            shippingCity: input.city,
            shippingDepartment: input.department,
            shippingPhone: input.phone,
            subtotal: realSubtotal,
            shippingCost: realShippingCost,
            shippingRateName: shippingRateName,
            discount: finalDiscount,
            total: realTotal,
            status: "PENDING",
            paymentMethod: input.paymentMethod,
            paymentExpiresAt,
            ...(couponQuote
              ? {
                  couponCode: couponQuote.code,
                  posPromotionId: couponQuote.promotionId,
                  couponDiscountType: couponQuote.discountType,
                  couponDiscountValue: couponQuote.discountValue,
                }
              : {}),
            items: {
              create: input.items.map((item, index) => {
                const realPrice = realPriceMap.get(item.variantId) ?? item.price;
                return {
                  productId: productSlugOf(item),
                  variantId: item.variantId,
                  name: item.name,
                  sku: item.sku,
                  colorName: item.colorName,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  size: item.size as any,
                  price: realPrice,
                  quantity: item.quantity,
                  total: realPrice * item.quantity,
                  couponDiscount: couponQuote?.lineDiscounts[index] ?? 0,
                  imageUrl: item.imageUrl ?? null,
                };
              }),
            },
          },
        });

        if (input.cedula) {
          await tx.$executeRaw`
            UPDATE "orders" SET "shippingCedula" = ${input.cedula}
            WHERE "orderNumber" = ${orderNumber}
          `;
        }

        return {
          order: { id: order.id, orderNumber: order.orderNumber, transactionId },
        };
      },
      {
        timeout: 20000,
        maxWait: 10000,
      }
    );
  }
}
