"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { EARLY_BIRD_DISCOUNT_PCT } from "@/lib/earlybird.constants";
import { getShippingCost } from "@/lib/shipping";

// ID fijo de la promoción Early Bird (creada en la migración)
const EARLY_BIRD_PROMOTION_ID = "early-bird-2026";

export interface CreateOrderInput {
  // Datos del comprador
  email: string;
  firstName: string;
  lastName: string;
  cedula: string;
  phone: string;

  // Datos de envío
  address: string;
  addressDetail?: string;
  city: string;
  department: string;
  /** Si el usuario eligió una dirección guardada, se vincula a la orden */
  savedAddressId?: string;

  // Pago
  paymentMethod: "BOLD" | "ADDI";

  // Carrito
  items: {
    variantId: string;
    productId: string;
    name: string;
    sku: string;
    colorName: string;
    size: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  }[];

  // Montos
  subtotal: number;
  shippingCost: number;
  discount: number;

  // Cupón (opcional)
  couponId?: string;
  couponCode?: string;
}

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  earlyBirdApplied?: boolean;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CV-${timestamp}-${random}`;
}

// ---------------------------------------------------------------------------
// createOrder — Server Action principal
// ---------------------------------------------------------------------------
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const {
    email,
    firstName,
    lastName,
    cedula,
    phone,
    address,
    addressDetail,
    city,
    department,
    savedAddressId,
    items,
    subtotal,
    shippingCost,
    discount,
    couponId,
  } = input;

  if (!items.length) {
    return { success: false, error: "El carrito está vacío" };
  }

  // Validación de campos requeridos
  if (!email || !firstName || !lastName || !address || !city || !department || !phone) {
    return { success: false, error: "Faltan campos requeridos" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Correo electrónico inválido" };
  }
  if (!/^\d{6,12}$/.test(cedula)) {
    return { success: false, error: "Cédula inválida (6–12 dígitos numéricos)" };
  }
  if (!/^\d{10}$/.test(phone)) {
    return { success: false, error: "Teléfono inválido (10 dígitos numéricos)" };
  }
  if (address.length > 200 || firstName.length > 50 || lastName.length > 80) {
    return { success: false, error: "Datos de dirección demasiado largos" };
  }
  if (items.some((item) => !item.variantId || !item.productId || item.price <= 0 || item.quantity <= 0)) {
    return { success: false, error: "Datos de producto inválidos" };
  }
  if (items.some((item) => item.quantity > 100)) {
    return { success: false, error: "Cantidad por producto excede el límite permitido" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Buscar o crear usuario guest/registrado
      let user = await tx.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user) {
        user = await tx.user.create({
          data: {
            email: email.toLowerCase(),
            name: `${firstName} ${lastName}`,
            phone,
          },
        });
      }

      // 2. Validar stock y obtener precios reales de la BD
      // Los precios del cliente (input.items[].price) NO son de confianza — un usuario
      // técnico podría manipularlos. Aquí los reemplazamos con los valores reales de la BD.
      const variantTypeMap = new Map<string, "product" | "item">();
      const realPriceMap   = new Map<string, number>(); // variantId → precio real en COP

      for (const item of items) {
        // ── Intentar como ProductVariant (producto normal) ─────────────────────
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
            throw new Error(`El producto "${item.name}" ya no está disponible`);
          }

          // Reserva atómica: UPDATE con WHERE (stock - reserved) >= quantity
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
            throw new Error(`Stock insuficiente para "${item.name}" (${item.colorName} / ${item.size})`);
          }

          variantTypeMap.set(item.variantId, "product");
          const realPrice = Number(productVariant.priceOverride ?? productVariant.product.basePrice);
          realPriceMap.set(item.variantId, realPrice);
        } else {
          // ── Intentar como ProductItemVariant (subcategoría de un conjunto) ───
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
            throw new Error(`Variante ${item.variantId} no encontrada`);
          }
          if (!itemVariant.isActive) {
            throw new Error(`El producto "${item.name}" ya no está disponible`);
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
            throw new Error(`Stock insuficiente para "${item.name}" (${item.colorName} / ${item.size})`);
          }

          variantTypeMap.set(item.variantId, "item");
          const realPrice = Number(
            itemVariant.color?.item?.price ??
            itemVariant.color?.item?.product?.basePrice ??
            item.price,
          );
          realPriceMap.set(item.variantId, realPrice);
        }
      }

      // Re-calcular subtotal desde los precios reales de la BD (ignora el subtotal del cliente)
      const realSubtotal = items.reduce(
        (sum, item) => sum + (realPriceMap.get(item.variantId) ?? item.price) * item.quantity,
        0,
      );

      // Re-calcular el costo de envío server-side (nunca confiar en el valor del cliente)
      const realShippingCost = getShippingCost(city, department);

      // 3. Re-validar el cupón contra la BD (no confiar en el monto enviado por el cliente)
      let couponDiscountAmount = 0;
      if (couponId) {
        const coupon = await (tx as any).coupon.findUnique({
          where: { id: couponId },
          select: { discountPercentage: true, isUsed: true, assignedEmail: true },
        });
        const couponValid =
          coupon &&
          !coupon.isUsed &&
          coupon.assignedEmail.toLowerCase() === email.toLowerCase();
        if (couponValid) {
          couponDiscountAmount = Math.round((realSubtotal * coupon.discountPercentage) / 100);
        }
      }

      // 4. Early Bird: calculado sobre el subtotal real (server-side, nunca confiar en el cliente)
      const earlyBirdApplied = user.earlyBirdDiscount === true;
      const earlyBirdDiscountAmount = earlyBirdApplied
        ? Math.round((realSubtotal * EARLY_BIRD_DISCOUNT_PCT) / 100)
        : 0;

      const finalDiscount = couponDiscountAmount + earlyBirdDiscountAmount;
      const realTotal     = realSubtotal + realShippingCost - finalDiscount;

      // 5. Generar número de orden y referencia única
      const orderNumber   = generateOrderNumber();
      const transactionId = randomUUID();

      // 6. Crear la orden en PENDING
      // Validar que el savedAddressId pertenezca al usuario (si se proveyó)
      if (savedAddressId) {
        const addrOwner = await tx.address.findUnique({
          where: { id: savedAddressId },
          select: { userId: true },
        });
        if (!addrOwner || addrOwner.userId !== user.id) {
          throw new Error("Dirección de envío inválida");
        }
      }

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          transactionId,
          ...(savedAddressId ? { addressId: savedAddressId } : {}),
          shippingName:       `${firstName} ${lastName}`,
          shippingAddress:    `${address}${addressDetail ? `, ${addressDetail}` : ""}`,
          shippingCity:       city,
          shippingDepartment: department,
          shippingPhone:      phone,
          subtotal:   realSubtotal,   // ← precio real de la BD
          shippingCost: realShippingCost,  // ← calculado server-side
          discount:   finalDiscount,
          total:      realTotal,       // ← total real calculado server-side
          earlyBirdDiscountApplied: earlyBirdApplied,
          ...(earlyBirdApplied ? { appliedPromotionId: EARLY_BIRD_PROMOTION_ID } : {}),
          status:        "PENDING",
          paymentMethod: input.paymentMethod,
          items: {
            create: items.map((item) => {
              const realPrice = realPriceMap.get(item.variantId) ?? item.price;
              return {
                productId: item.productId,
                variantId: item.variantId,
                name:      item.name,
                sku:       item.sku,
                colorName: item.colorName,
                size:      item.size as any,
                price:     realPrice,                   // ← precio real de la BD
                quantity:  item.quantity,
                total:     realPrice * item.quantity,   // ← total real por ítem
                imageUrl:  item.imageUrl ?? null,
              };
            }),
          },
        },
      });

      // Guardar cédula como snapshot usando raw SQL (el cliente Prisma puede no
      // conocer shippingCedula hasta que se regenere tras la migración).
      if (cedula) {
        await tx.$executeRaw`
          UPDATE "orders" SET "shippingCedula" = ${cedula}
          WHERE "orderNumber" = ${orderNumber}
        `;
      }

      // 7. Stock ya fue reservado atómicamente en el paso 2 (UPDATE con WHERE guard).
      // No se necesita un segundo loop de reserva.

      // 8. Marcar cupón como usado (si aplica y fue validado arriba)
      if (couponId && couponDiscountAmount > 0) {
        await (tx as any).coupon.update({
          where: { id: couponId },
          data: {
            isUsed:       true,
            usedAt:       new Date(),
            usedByOrderId: order.id,
          },
        });
      }

      // 9. Consumir el descuento Early Bird para que no se aplique en futuras compras.
      // Se restaura en releaseOrderStock si el pago falla, igual que el cupón.
      if (earlyBirdApplied) {
        await tx.user.update({
          where: { id: user.id },
          data: { earlyBirdDiscount: false },
        });
      }

      return { order, earlyBirdApplied };
    }, {
      // Neon usa PgBouncer (connection pooler) que agrega latencia por query.
      // Con múltiples items + dirección guardada + early bird la transacción
      // excede fácilmente el default de 5 s → aumentamos a 20 s.
      timeout: 20000,
      maxWait: 10000,
    });

    const { order, earlyBirdApplied } = result;

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      earlyBirdApplied: result.earlyBirdApplied,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno al crear la orden";
    console.error("[createOrder] Error:", err);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// releaseOrderStock — Libera reservas de stock y cupón cuando el pago falla/se cancela.
//
// Se llama desde los webhooks de Bold/Addi cuando la transacción es rechazada,
// cancelada o reembolsada. Es idempotente: si la orden ya está en estado terminal
// o no existe, no hace nada.
//
// Stock:
//   - ProductVariant (normal):       decrement reserved (stock físico ya no se tocó)
//   - ProductItemVariant (conjunto):  increment stock  (fue decrementado en createOrder)
//
// Cupón:
//   - Si la orden tenía un cupón reservado (usedByOrderId = order.id), lo libera.
//   - Así el usuario puede intentar la compra de nuevo con el mismo cupón.
// ---------------------------------------------------------------------------
export async function releaseOrderStock(
  transactionId: string,
  newStatus: "FAILED" | "REFUNDED" | "CANCELLED",
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
        console.log(`[releaseOrderStock] Orden ${order.orderNumber} ya en estado ${order.status} — sin acción`);
        return;
      }

      // 1. Actualizar estado de la orden
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: newStatus as any,
          ...(newStatus === "CANCELLED" ? { cancelledAt: new Date() } : {}),
        },
      });

      // 2. Liberar stock de cada ítem
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
          // ProductItemVariant (conjunto): el stock fue descontado directamente en createOrder
          await (tx as any).productItemVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // 3. Liberar cupón si aplica (para que el usuario pueda reintentarlo)
      await (tx as any).coupon.updateMany({
        where: {
          usedByOrderId: order.id,
          isUsed: true,
        },
        data: {
          isUsed:        false,
          usedAt:        null,
          usedByOrderId: null,
        },
      });

      // 4. Restaurar descuento Early Bird SOLO si el usuario no ha completado todavía
      // una compra con el descuento aplicado. Sin esta verificación, un webhook tardío
      // de un intento fallido podría restaurar el flag después de un pago exitoso.
      if (order.earlyBirdDiscountApplied) {
        const alreadyUsedSuccessfully = await tx.order.findFirst({
          where: {
            userId: order.userId,
            earlyBirdDiscountApplied: true,
            status: "PAID",
            id: { not: order.id },
          },
          select: { id: true },
        });

        if (!alreadyUsedSuccessfully) {
          await tx.user.update({
            where: { id: order.userId },
            data: { earlyBirdDiscount: true },
          });
        } else {
          console.info(
            `[releaseOrderStock] Early Bird NO restaurado — usuario ${order.userId} ya tiene orden PAID con descuento`
          );
        }
      }

      console.log(`[releaseOrderStock] ✓ Stock, cupón y early bird liberados — orden ${order.orderNumber} → ${newStatus}`);
    });
  } catch (err) {
    // No relanzar — el estado de la orden ya fue actualizado antes de este punto en los webhooks.
    // Loguear para investigación manual si el stock no se liberó correctamente.
    console.error("[releaseOrderStock] Error liberando stock:", err instanceof Error ? err.message : err);
  }
}

// ---------------------------------------------------------------------------
// markOrderPaid — Llamado desde el webhook de Bold/Addi
// Usa transacción atómica: si algo falla, NADA se guarda (evita estados inconsistentes).
// Es idempotente: si la orden ya está PAID, no hace nada (retorna orden sin cambios).
// Retorna la orden completa con usuario e items (necesarios para envío de email).
// ---------------------------------------------------------------------------
export async function markOrderPaid(transactionId: string, paymentId: string) {
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { transactionId },
      include: { items: true, user: true },
    });

    if (!order) throw new Error(`Orden no encontrada: ${transactionId}`);
    // Idempotencia: Bold puede reenviar el mismo webhook múltiples veces
    if (order.status === "PAID") return order;

    // 1. Marcar la orden como pagada
    const updatedOrder = await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID", paymentId, paidAt: new Date() },
      include: { items: true, user: true },
    });

    // 2. Descontar stock real y liberar reserva
    // IMPORTANTE: los ítems de un conjunto (isSet) usan ProductItemVariant (sin campo `reserved`),
    // mientras que los productos normales usan ProductVariant (con `stock` y `reserved`).
    // Intentamos primero en ProductVariant; si no existe, caemos a ProductItemVariant.
    for (const item of order.items) {
      const productVariant = await tx.productVariant.findUnique({
        where: { id: item.variantId },
        select: { id: true },
      });

      if (productVariant) {
        // Producto normal: descontar stock físico y liberar reserva
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
            reserved: { decrement: item.quantity },
          },
        });
      }
      // ProductItemVariant: el stock ya fue descontado al crear la orden (no tiene campo 'reserved').
      // No se descuenta de nuevo aquí para evitar doble decremento.
    }

    // 3. Crear notificación para el admin
    await (tx as any).adminNotification.create({
      data: {
        orderId: updatedOrder.id,
        title: `Pedido pagado · ${updatedOrder.orderNumber}`,
        body: `${updatedOrder.user?.name ?? "Cliente"} · ${new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(Number(updatedOrder.total))}`,
      },
    });

    return updatedOrder;
  });

  return result;
}
