import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { quoteShippingForAddress } from "@/modules/shipping/application/pos-shipping";
import { applyFreeShipping } from "@/modules/shipping/domain/resolve-shipping-price";
import { computeOrderPaymentExpiresAt } from "../domain/order-payment-grace";
import { quoteCouponWithPos, type CouponQuote } from "./pos-coupon";
import { resolvePosLinePrices } from "./pos-line-prices";
import { productSlugsByKeys } from "@/lib/product-keys";
import { parsePosLineId } from "@/modules/posIntegration/domain/pos-mapper";
import { isPosCatalogConfigured } from "@/modules/posIntegration/infrastructure/pos-config";
import type { PosColorPalette } from "@/modules/posIntegration/domain/pos-color-palette";
import { assertWebColorSellable } from "../domain/web-color-guard";
import {
  CouponAlreadyUsedError,
  CouponExhaustedError,
  CouponExpiredError,
  CouponInactiveError,
  CouponNotApplicableError,
  CouponNotYetValidError,
  InvalidAddressError,
  OutOfStockError,
  ProductUnavailableError,
  VariantNotFoundError,
} from "../application/checkout.errors";
import type { CreateOrderInputDTO } from "../contracts/create-order.dto";

function generateOrderNumber(): string {
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

/**
 * Precio de lista de un ítem de Neon (sin reservar nada), para validar el cupón con el POS antes de la
 * transacción. Dentro de la transacción se vuelve a leer: si cambió entre tanto, el cupón se rechaza.
 */
async function neonListPrice(variantId: string, fallback: number): Promise<number> {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { priceOverride: true, product: { select: { basePrice: true } } },
  });
  if (variant) return Number(variant.priceOverride ?? variant.product.basePrice);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemVariant = await (prisma as any).productItemVariant.findUnique({
    where: { id: variantId },
    select: { color: { select: { item: { select: { price: true, product: { select: { basePrice: true } } } } } } },
  });
  return Number(itemVariant?.color?.item?.price ?? itemVariant?.color?.item?.product?.basePrice ?? fallback);
}

// ---------------------------------------------------------------------------
// PrismaCheckoutRepository
//
// Encapsula la transacción atómica completa de creación de orden.
// ---------------------------------------------------------------------------
export class PrismaCheckoutRepository {
  /**
   * `palette`: colores del POS. Un producto creado en la web solo se vende en los colores que el POS tiene
   * (los demás ya no se muestran en la tienda); `null` = sin integración con el POS, no se restringe.
   */
  async createOrderTransaction(
    input: CreateOrderInputDTO,
    palette: PosColorPalette | null = null,
  ): Promise<CreatedOrderRecord> {
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

    // Ítems del POS (SKU como variantId): precio del POS; no se reservan en la web (el POS ya
    // verificó el stock en verifyPosAvailability y lo descuenta al registrar la venta).
    const posPrices = await resolvePosLinePrices(input.items);

    // El pedido identifica el producto por su slug (reseñas, prueba social): el carrito puede traer aún
    // el id de Neon (carritos guardados antes de la migración).
    const slugByKey = await productSlugsByKeys(prisma, input.items.map((item) => item.productId));
    const productSlugOf = (item: { productId: string; variantId: string }) =>
      parsePosLineId(item.variantId)?.slug ?? slugByKey.get(item.productId) ?? item.productId;

    // Cupón: lo valida el POS con los precios reales (red ANTES del $transaction). El POS calcula el
    // descuento y su reparto por línea; la web no lo recalcula.
    let couponQuote: Extract<CouponQuote, { valid: true }> | null = null;
    const quotedPrices: number[] = [];
    if (input.couponCode?.trim()) {
      for (const item of input.items) {
        quotedPrices.push(posPrices.get(item.variantId) ?? (await neonListPrice(item.variantId, item.price)));
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

    const posIntegrated = isPosCatalogConfigured();

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

        // 2. Validar stock y obtener precios reales de la BD
        const variantTypeMap = new Map<string, "product" | "item">();
        const realPriceMap = new Map<string, number>();

        for (const item of input.items) {
          const posPrice = posPrices.get(item.variantId);
          if (posPrice !== undefined) {
            realPriceMap.set(item.variantId, posPrice);
            continue;
          }

          const productVariant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: {
              isActive: true,
              priceOverride: true,
              color: { select: { name: true } },
              product: { select: { basePrice: true, posSlug: true } },
            },
          });

          if (productVariant) {
            // Solo se venden productos del POS: el pedido de uno creado solo en la web no llegaría al POS,
            // que es quien despacha (p. ej. un carrito guardado antes de retirarlos).
            if (!productVariant.isActive || (posIntegrated && !productVariant.product.posSlug)) {
              throw new ProductUnavailableError(`El producto "${item.name}" ya no está disponible`);
            }
            assertWebColorSellable(
              palette,
              { posSlug: productVariant.product.posSlug, colorName: productVariant.color.name },
              item.name
            );

            const reserved = await tx.$queryRaw<{ id: string }[]>`
              UPDATE product_variants
              SET reserved = reserved + ${item.quantity}
              WHERE id = ${item.variantId}
                AND "isActive" = true
                AND (stock - reserved) >= ${item.quantity}
              RETURNING id
            `;

            if (reserved.length === 0) {
              throw new OutOfStockError(
                `Stock insuficiente para "${item.name}" (${item.colorName} / ${item.size})`
              );
            }

            variantTypeMap.set(item.variantId, "product");
            const realPrice = Number(
              productVariant.priceOverride ?? productVariant.product.basePrice
            );
            realPriceMap.set(item.variantId, realPrice);
          } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const itemVariant = await (tx as any).productItemVariant.findUnique({
              where: { id: item.variantId },
              select: {
                isActive: true,
                color: {
                  select: {
                    name: true,
                    item: {
                      select: {
                        price: true,
                        product: { select: { basePrice: true, posSlug: true } },
                      },
                    },
                  },
                },
              },
            });
            if (!itemVariant) {
              throw new VariantNotFoundError(`Variante ${item.variantId} no encontrada`);
            }
            if (!itemVariant.isActive || (posIntegrated && !itemVariant.color?.item?.product?.posSlug)) {
              throw new ProductUnavailableError(`El producto "${item.name}" ya no está disponible`);
            }
            assertWebColorSellable(
              palette,
              { posSlug: itemVariant.color?.item?.product?.posSlug, colorName: itemVariant.color?.name },
              item.name
            );

            const reservedItem = await tx.$queryRaw<{ id: string }[]>`
              UPDATE product_item_variants
              SET stock = stock - ${item.quantity}
              WHERE id = ${item.variantId}
                AND "isActive" = true
                AND stock >= ${item.quantity}
              RETURNING id
            `;

            if (reservedItem.length === 0) {
              throw new OutOfStockError(
                `Stock insuficiente para "${item.name}" (${item.colorName} / ${item.size})`
              );
            }

            variantTypeMap.set(item.variantId, "item");
            const realPrice = Number(
              itemVariant.color?.item?.price ??
                itemVariant.color?.item?.product?.basePrice ??
                item.price
            );
            realPriceMap.set(item.variantId, realPrice);
          }
        }

        const realSubtotal = input.items.reduce(
          (sum, item) =>
            sum + (realPriceMap.get(item.variantId) ?? item.price) * item.quantity,
          0
        );

        // 3. Cupón validado por el POS: se aplica solo si los precios no cambiaron desde la validación.
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

        const orderNumber = generateOrderNumber();
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

        void variantTypeMap;

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
