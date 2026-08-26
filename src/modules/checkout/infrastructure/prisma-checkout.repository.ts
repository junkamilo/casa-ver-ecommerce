import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getShippingCost } from "@/modules/shipping/application/use-cases/get-shipping-cost.use-case";
import {
  calculateCouponDiscount,
  calculateCouponDiscountAmount,
  hasUserExceededCouponLimit,
  isCouponEligibleForEmail,
  isCouponGloballyAvailable,
  isPromotionalCoupon,
  PROMOTIONAL_MAX_USES_PER_USER,
  type CouponDiscountType,
} from "../domain/coupon.entity";
import { computeOrderPaymentExpiresAt } from "../domain/order-payment-grace";
import { validateCouponTimeWindow } from "../domain/validate-coupon-time-window";
import {
  CouponAlreadyUsedError,
  CouponExhaustedError,
  CouponInactiveError,
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

// ---------------------------------------------------------------------------
// PrismaCheckoutRepository
//
// Encapsula la transacción atómica completa de creación de orden.
// ---------------------------------------------------------------------------
export class PrismaCheckoutRepository {
  async createOrderTransaction(input: CreateOrderInputDTO): Promise<CreatedOrderRecord> {
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
          const productVariant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: {
              isActive: true,
              priceOverride: true,
              product: { select: { basePrice: true } },
            },
          });

          if (productVariant) {
            if (!productVariant.isActive) {
              throw new ProductUnavailableError(`El producto "${item.name}" ya no está disponible`);
            }

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
                    item: {
                      select: {
                        price: true,
                        product: { select: { basePrice: true } },
                      },
                    },
                  },
                },
              },
            });
            if (!itemVariant) {
              throw new VariantNotFoundError(`Variante ${item.variantId} no encontrada`);
            }
            if (!itemVariant.isActive) {
              throw new ProductUnavailableError(`El producto "${item.name}" ya no está disponible`);
            }

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

        // 3. Re-validar el cupón contra la BD (Fase 2)
        let couponDiscountAmount = 0;
        let appliedCouponId: string | undefined;

        if (input.couponId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const coupon = await (tx as any).coupon.findUnique({
            where: { id: input.couponId },
            select: {
              id: true,
              kind: true,
              discountType: true,
              discountValue: true,
              discountPercentage: true,
              isUsed: true,
              assignedEmail: true,
              isActive: true,
              scheduleMode: true,
              validFrom: true,
              validTo: true,
              expiresAt: true,
              maxGlobalUses: true,
              currentGlobalUses: true,
              maxUsesPerUser: true,
            },
          });

          if (!coupon) {
            throw new CouponExhaustedError("El cupón no existe");
          }

          if (isPromotionalCoupon(coupon.kind)) {
            if (coupon.isActive === false) {
              throw new CouponInactiveError();
            }
            validateCouponTimeWindow(coupon);
            if (!isCouponGloballyAvailable(coupon)) {
              throw new CouponExhaustedError();
            }

            const normalizedEmail = input.email.toLowerCase().trim();
            const normalizedDocumentId = input.cedula.trim();

            const previousUsageCount = await tx.couponUsage.count({
              where: {
                couponId: coupon.id,
                OR: [
                  { email: normalizedEmail },
                  { documentId: normalizedDocumentId },
                  ...(user.id ? [{ userId: user.id }] : []),
                ],
              },
            });

            if (
              hasUserExceededCouponLimit(
                previousUsageCount,
                PROMOTIONAL_MAX_USES_PER_USER
              )
            ) {
              throw new CouponAlreadyUsedError();
            }

            couponDiscountAmount = calculateCouponDiscountAmount(
              realSubtotal,
              coupon.discountType as CouponDiscountType,
              coupon.discountValue
            );
            appliedCouponId = coupon.id;
          } else if (isCouponEligibleForEmail(coupon, input.email)) {
            let canRedeem = true;
            if (coupon && !coupon.assignedEmail) {
              const normalizedEmail = input.email.toLowerCase().trim();
              const registeredUser = await tx.user.findUnique({
                where: { email: normalizedEmail },
                select: { id: true },
              });
              canRedeem = !!registeredUser;
            }
            if (canRedeem) {
              couponDiscountAmount = calculateCouponDiscount(
                realSubtotal,
                coupon.discountPercentage
              );
              appliedCouponId = coupon.id;
            }
          }
        }

        const finalDiscount = couponDiscountAmount;
        const netSubtotal = realSubtotal - finalDiscount;

        const municipality = await tx.municipality.findFirst({
          where: { name: input.city, department: { name: input.department } },
          include: { shippingRate: true, department: true }
        });

        if (!municipality) {
          throw new InvalidAddressError("Municipio no encontrado para envío");
        }

        const shippingQuote = await getShippingCost({
          subtotalNeto: netSubtotal,
          municipalityId: municipality.id,
        });

        if (!shippingQuote.ok) {
          throw new InvalidAddressError("No hay cobertura para esta dirección");
        }
        const realShippingCost = shippingQuote.cost;
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
            shippingRateName: shippingQuote.rateName,
            discount: finalDiscount,
            total: realTotal,
            status: "PENDING",
            paymentMethod: input.paymentMethod,
            paymentExpiresAt,
            ...(appliedCouponId ? { appliedCouponId } : {}),
            items: {
              create: input.items.map((item) => {
                const realPrice = realPriceMap.get(item.variantId) ?? item.price;
                return {
                  productId: item.productId,
                  variantId: item.variantId,
                  name: item.name,
                  sku: item.sku,
                  colorName: item.colorName,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  size: item.size as any,
                  price: realPrice,
                  quantity: item.quantity,
                  total: realPrice * item.quantity,
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

        if (input.couponId && couponDiscountAmount > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const coupon = await (tx as any).coupon.findUnique({
            where: { id: input.couponId },
            select: { kind: true },
          });

          if (coupon && !isPromotionalCoupon(coupon.kind)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (tx as any).coupon.update({
              where: { id: input.couponId },
              data: {
                isUsed: true,
                usedAt: new Date(),
                usedByOrderId: order.id,
              },
            });
          }
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
