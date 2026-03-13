"use server";

import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------
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

  // Pago
  paymentMethod: "BOLD";

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
  redirectUrl?: string;
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
// createBoldPayment — Llamada a Bold API Sandbox/Integración
//
// Tarjetas de prueba de Bold (Sandbox):
// ✓ APROBADA:  4532015112830366 | CVC: 123 | Exp: 12/25
// ✗ RECHAZADA: 4111111111111111 | CVC: 123 | Exp: 12/25
// ---------------------------------------------------------------------------
async function createBoldPayment(
  orderReference: string,
  amount: number,
  email: string,
  phone: string
): Promise<{ boldUrl?: string; error?: string }> {
  const integrationKey = process.env.BOLD_INTEGRATION_KEY;
  if (!integrationKey) {
    return { error: "Variable BOLD_INTEGRATION_KEY no configurada" };
  }

  const boldApiUrl = process.env.BOLD_API_URL || "https://api.sandbox.bold.com/v1";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return { error: "Variable NEXT_PUBLIC_APP_URL no configurada" };
  }

  try {
    const payload = {
      amount_in_cents: Math.round(amount * 100),
      currency: "COP",
      reference: orderReference,
      description: `Pedido Casa Verde - ${orderReference}`,
      redirect_url: {
        success: `${appUrl}/checkout/success?orderId=${orderReference}`,
        failure: `${appUrl}/checkout?error=pago_fallido`,
        pending: `${appUrl}/checkout/pending?orderId=${orderReference}&method=BOLD`,
      },
      customer: {
        email: email,
        phone: phone,
      },
    };

    const response = await fetch(`${boldApiUrl}/payment_links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${integrationKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[createBoldPayment] Error:", errorData);
      return {
        error: errorData.message || "Error al crear el pago en Bold",
      };
    }

    const data = await response.json();

    if (!data.url && !data.payment_link) {
      console.error("[createBoldPayment] No redirect URL:", data);
      return { error: "Bold no devolvió una URL de pago" };
    }

    return { boldUrl: data.url || data.payment_link };
  } catch (err) {
    console.error("[createBoldPayment] Exception:", err);
    return { error: err instanceof Error ? err.message : "Error desconocido" };
  }
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
    items,
    subtotal,
    shippingCost,
    discount,
    couponId,
  } = input;

  if (!items.length) {
    return { success: false, error: "El carrito está vacío" };
  }

  const total = subtotal + shippingCost - discount;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return { success: false, error: "Variable NEXT_PUBLIC_APP_URL no configurada" };

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
      const transactionId = crypto.randomUUID();

      // 4. Crear la orden en PENDING
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          transactionId,
          shippingName: `${firstName} ${lastName}`,
          shippingAddress: `${address}${addressDetail ? `, ${addressDetail}` : ""}`,
          shippingCity: city,
          shippingDepartment: department,
          shippingPhone: phone,
          subtotal,
          shippingCost,
          discount,
          total,
          status: "PENDING",
          paymentMethod: "BOLD",
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

      return { order, transactionId };
    });

    const { order, transactionId } = result;

    // 7. Crear pago en Bold
    const boldResult = await createBoldPayment(transactionId, Number(order.total), email, phone);

    if (boldResult.error) {
      throw new Error(boldResult.error);
    }

    if (!boldResult.boldUrl) {
      throw new Error("No se pudo obtener URL de Bold");
    }

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      redirectUrl: boldResult.boldUrl,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno al crear la orden";
    console.error("[createOrder] Error:", err);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// markOrderPaid — Llamado desde el webhook de Bold
// ---------------------------------------------------------------------------
export async function markOrderPaid(transactionId: string, paymentId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { transactionId },
      include: { items: true },
    });

    if (!order) throw new Error(`Orden no encontrada: ${transactionId}`);
    if (order.status === "PAID") return; // Idempotencia

    await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID", paymentId, paidAt: new Date() },
    });

    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: { decrement: item.quantity },
          reserved: { decrement: item.quantity },
        },
      });
    }
  });
}
