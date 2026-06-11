import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getShippingCost } from "@/lib/shipping";
import { calculateEarlyBirdDiscount, isUserEligibleForEarlyBird } from "../domain/early-bird.entity";
import {
  calculateCouponDiscount,
  isCouponEligibleForEmail,
} from "../domain/coupon.entity";
import {
  InvalidAddressError,
  OutOfStockError,
  ProductUnavailableError,
  VariantNotFoundError,
} from "../application/checkout.errors";
import type { CreateOrderInputDTO } from "../contracts/create-order.dto";

// ID fijo de la promoción Early Bird (creada en la migración).
// Se mantiene byte-a-byte el comportamiento legacy: cuando el descuento Early
// Bird aplica, se enlaza la orden a esta promoción.
const EARLY_BIRD_PROMOTION_ID = "early-bird-2026";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CV-${timestamp}-${random}`;
}

export interface CreatedOrderRecord {
  order: { id: string; orderNumber: string };
  earlyBirdApplied: boolean;
}

// ---------------------------------------------------------------------------
// PrismaCheckoutRepository
//
// Encapsula la transacción atómica completa de creación de orden. Mantiene
// byte-a-byte la lógica de `createOrder` original (src/app/actions/checkout.ts
// líneas 122-345) para garantizar idéntico comportamiento bajo carga:
//
//   1. findOrCreate User con email lowercase (guest o registrado).
//   2. Reserva atómica de stock por item:
//      - ProductVariant: UPDATE con WHERE (stock - reserved) >= quantity
//      - ProductItemVariant (conjuntos): UPDATE con stock = stock - quantity
//      Ambos usan $queryRaw RETURNING id para detectar fallo (race-safe).
//   3. Re-cálculo subtotal con precios reales de BD.
//   4. Re-cálculo shippingCost con getShippingCost(city, dept) server-side.
//   5. Re-validación cupón contra BD (email + isUsed=false).
//   6. Cálculo Early Bird sobre subtotal real.
//   7. Validación savedAddressId pertenece al usuario.
//   8. Create Order + items + shippingCedula vía $executeRaw.
//   9. Marca cupón usado y consume el flag earlyBirdDiscount del usuario.
//
// timeout 20000 / maxWait 10000 — Neon usa PgBouncer y la transacción
// excede fácilmente el default de 5s con varios items + dirección + early
// bird.
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
        // Los precios del cliente (input.items[].price) NO son de confianza —
        // un usuario técnico podría manipularlos. Aquí los reemplazamos con
        // los valores reales de la BD.
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

            // Reserva atómica: UPDATE con WHERE (stock - reserved) >= quantity.
            // Esto elimina la race condition: si dos transacciones concurrentes
            // compiten por el último stock, solo una pasa el WHERE y reserva.
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
            // Subcategoría de un conjunto (ProductItemVariant)
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

            // Reserva atómica para subcategorías (conjuntos)
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

        // Re-calcular subtotal desde los precios reales de BD
        const realSubtotal = input.items.reduce(
          (sum, item) =>
            sum + (realPriceMap.get(item.variantId) ?? item.price) * item.quantity,
          0
        );

        // Re-calcular shippingCost server-side
        const realShippingCost = getShippingCost(input.city, input.department);

        // 3. Re-validar el cupón contra la BD (no confiar en el monto del cliente)
        let couponDiscountAmount = 0;
        if (input.couponId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const coupon = await (tx as any).coupon.findUnique({
            where: { id: input.couponId },
            select: { discountPercentage: true, isUsed: true, assignedEmail: true },
          });
          if (isCouponEligibleForEmail(coupon, input.email)) {
            couponDiscountAmount = calculateCouponDiscount(
              realSubtotal,
              coupon.discountPercentage
            );
          }
        }

        // 4. Early Bird (sobre subtotal real)
        const earlyBirdApplied = isUserEligibleForEarlyBird(user);
        const earlyBirdDiscountAmount = calculateEarlyBirdDiscount(realSubtotal, earlyBirdApplied);

        const finalDiscount = couponDiscountAmount + earlyBirdDiscountAmount;
        const realTotal = realSubtotal + realShippingCost - finalDiscount;

        // 5. Generar número de orden y referencia única
        const orderNumber = generateOrderNumber();
        const transactionId = randomUUID();

        // 6. Validar savedAddressId pertenece al usuario
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
            discount: finalDiscount,
            total: realTotal,
            earlyBirdDiscountApplied: earlyBirdApplied,
            ...(earlyBirdApplied ? { appliedPromotionId: EARLY_BIRD_PROMOTION_ID } : {}),
            status: "PENDING",
            paymentMethod: input.paymentMethod,
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

        // Guardar cédula como snapshot vía raw SQL (el cliente Prisma puede no
        // conocer shippingCedula hasta que se regenere tras la migración).
        if (input.cedula) {
          await tx.$executeRaw`
            UPDATE "orders" SET "shippingCedula" = ${input.cedula}
            WHERE "orderNumber" = ${orderNumber}
          `;
        }

        // 7. Stock ya fue reservado atómicamente arriba — no segundo loop.

        // 8. Marcar cupón como usado (si aplica y fue validado)
        if (input.couponId && couponDiscountAmount > 0) {
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

        // 9. Consumir el descuento Early Bird (se restaura en releaseOrderStock
        //    si el pago falla, igual que el cupón).
        if (earlyBirdApplied) {
          await tx.user.update({
            where: { id: user.id },
            data: { earlyBirdDiscount: false },
          });
        }

        // variantTypeMap se mantiene en memoria para futuras extensiones
        // (analytics, logs); no se persiste pero replicamos exactamente la
        // misma estructura interna del código original.
        void variantTypeMap;

        return {
          order: { id: order.id, orderNumber: order.orderNumber },
          earlyBirdApplied,
        };
      },
      {
        // Neon usa PgBouncer (connection pooler) que agrega latencia por query.
        // Con múltiples items + dirección guardada + early bird la transacción
        // excede fácilmente el default de 5 s → aumentamos a 20 s.
        timeout: 20000,
        maxWait: 10000,
      }
    );
  }
}
