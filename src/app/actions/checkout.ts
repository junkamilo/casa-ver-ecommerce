"use server";

import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { EARLY_BIRD_DISCOUNT_PCT } from "@/lib/earlybird.constants";

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

      // Early Bird: si el usuario tiene el descuento, calcularlo server-side (no confiar en el cliente)
      const earlyBirdApplied = user.earlyBirdDiscount === true;
      const earlyBirdDiscountAmount = earlyBirdApplied
        ? Math.round((subtotal * EARLY_BIRD_DISCOUNT_PCT) / 100)
        : 0;
      // El descuento final es: cupón (validado en frontend + aquí) + early bird
      const finalDiscount = discount + earlyBirdDiscountAmount;
      const total = subtotal + shippingCost - finalDiscount;

      // 2. Validar stock
      const variantTypeMap = new Map<string, "product" | "item">();

      for (const item of items) {
        const productVariant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true, reserved: true, isActive: true },
        });

        if (productVariant) {
          variantTypeMap.set(item.variantId, "product");
          if (!productVariant.isActive) {
            throw new Error(`El producto "${item.name}" ya no está disponible`);
          }
          const available = productVariant.stock - productVariant.reserved;
          if (available < item.quantity) {
            throw new Error(`Stock insuficiente para "${item.name}" (${item.colorName} / ${item.size})`);
          }
        } else {
          const itemVariant = await (tx as any).productItemVariant.findUnique({
            where: { id: item.variantId },
            select: { stock: true, isActive: true },
          });
          if (!itemVariant) {
            throw new Error(`Variante ${item.variantId} no encontrada`);
          }
          variantTypeMap.set(item.variantId, "item");
          if (!itemVariant.isActive) {
            throw new Error(`El producto "${item.name}" ya no está disponible`);
          }
          if (itemVariant.stock < item.quantity) {
            throw new Error(`Stock insuficiente para "${item.name}" (${item.colorName} / ${item.size})`);
          }
        }
      }

      // 3. Generar número de orden y referencia única
      const orderNumber = generateOrderNumber();
      const transactionId = randomUUID();

      // 4. Crear la orden en PENDING
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
          shippingName: `${firstName} ${lastName}`,
          shippingAddress: `${address}${addressDetail ? `, ${addressDetail}` : ""}`,
          shippingCity: city,
          shippingDepartment: department,
          shippingPhone: phone,
          subtotal,
          shippingCost,
          discount: finalDiscount,
          total,
          earlyBirdDiscountApplied: earlyBirdApplied,
          // Vincular a la promoción cuando el descuento Early Bird aplica
          ...(earlyBirdApplied
            ? { appliedPromotionId: EARLY_BIRD_PROMOTION_ID }
            : {}),
          status: "PENDING",
          paymentMethod: input.paymentMethod,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.name,
              sku: item.sku,
              colorName: item.colorName,
              size: item.size as any,
              price: item.price,
              quantity: item.quantity,
              total: item.price * item.quantity,
              imageUrl: item.imageUrl ?? null,
            })),
          },
        },
      });

      // 5. Reservar stock
      for (const item of items) {
        if (variantTypeMap.get(item.variantId) === "product") {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { reserved: { increment: item.quantity } },
          });
        } else {
          await (tx as any).productItemVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // 6. Marcar cupón como usado (si aplica)
      if (couponId) {
        await (tx as any).coupon.update({
          where: { id: couponId },
          data: {
            isUsed: true,
            usedAt: new Date(),
            usedByOrderId: order.id,
          },
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
