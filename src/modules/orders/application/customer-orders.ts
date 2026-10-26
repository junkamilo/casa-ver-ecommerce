import { prisma } from "@/lib/prisma";
import {
  getPosOrderStatus,
  isPosCatalogConfigured,
  listPosOrders,
  postOrderStatus,
} from "@/modules/posIntegration/infrastructure/pos-catalog.client";
import type { PosCustomerOrder } from "@/modules/posIntegration/contracts/pos-catalog.schema";
import { isReportedToPos, toCustomerOrderView, type CustomerOrderView } from "../domain/customer-order";

const ORDER_PAGE_LIMIT = 50;

/**
 * «Mis pedidos» del cliente: el pago sale de Neon y la logística (estado, guía, fechas, destinatario y
 * prendas) del POS, que es la única fuente de verdad (GET /api/public/orders). Si el POS no responde se
 * muestran los pedidos con lo que sabe la web y `posAvailable = false`.
 */
export async function getCustomerOrders(userId: string): Promise<{ orders: CustomerOrderView[]; posAvailable: boolean }> {
  const orders = await prisma.order.findMany({
    where: { userId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      total: true,
      subtotal: true,
      shippingCost: true,
      discount: true,
      paymentMethod: true,
      paidAt: true,
      shippingName: true,
      shippingAddress: true,
      shippingCity: true,
      shippingDepartment: true,
      items: {
        select: { id: true, variantId: true, name: true, imageUrl: true, colorName: true, size: true, quantity: true, price: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: ORDER_PAGE_LIMIT,
  });

  const reported = orders.filter((o) => isReportedToPos(o.status, o.paidAt)).map((o) => o.orderNumber);
  let byNumber = new Map<string, PosCustomerOrder>();
  let posAvailable = true;
  if (reported.length > 0 && isPosCatalogConfigured()) {
    try {
      const { items } = await listPosOrders({ orderNumbers: reported, size: ORDER_PAGE_LIMIT });
      byNumber = new Map(items.map((o) => [o.orderNumber, o]));
    } catch (error) {
      posAvailable = false;
      console.warn("[Mis pedidos] El POS no respondió; se muestra lo que tiene la web:", error);
    }
  }

  return {
    posAvailable,
    orders: orders.map((o) =>
      toCustomerOrderView(
        {
          ...o,
          total: Number(o.total),
          subtotal: Number(o.subtotal ?? 0),
          shippingCost: Number(o.shippingCost ?? 0),
          discount: Number(o.discount ?? 0),
          items: o.items.map((i) => ({ ...i, size: String(i.size), price: Number(i.price) })),
        },
        byNumber.get(o.orderNumber) ?? null,
      ),
    ),
  };
}

export type ConfirmDeliveryResult =
  | { ok: true }
  | { ok: false; status: 400 | 403 | 404 | 503; message: string };

/**
 * El cliente confirma en «Mis pedidos» que recibió el pedido: lo marca entregado en el POS (Tienda → Pedidos),
 * que guarda el cambio en su historial como confirmado por el cliente. Solo un pedido en camino.
 */
export async function confirmCustomerDelivery(userId: string, orderId: string): Promise<ConfirmDeliveryResult> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true, orderNumber: true } });
  if (!order) return { ok: false, status: 404, message: "Pedido no encontrado" };
  if (order.userId !== userId) return { ok: false, status: 403, message: "No autorizado" };
  if (!isPosCatalogConfigured()) {
    return { ok: false, status: 503, message: "No pudimos confirmar la entrega. Intenta más tarde." };
  }

  try {
    const pos = await getPosOrderStatus(order.orderNumber);
    if (!pos || pos.fulfillmentStatus !== "SHIPPED") {
      return { ok: false, status: 400, message: "Solo puedes confirmar un pedido que esté en camino" };
    }
    await postOrderStatus(order.orderNumber, {
      status: "DELIVERED",
      confirmedByCustomer: true,
      note: "Entrega confirmada por el cliente desde su perfil web",
      changedAt: new Date().toISOString(),
    });
    return { ok: true };
  } catch (error) {
    console.error(`[Mis pedidos] No se pudo confirmar la entrega de ${order.orderNumber}:`, error);
    return { ok: false, status: 503, message: "No pudimos confirmar la entrega. Intenta más tarde." };
  }
}
