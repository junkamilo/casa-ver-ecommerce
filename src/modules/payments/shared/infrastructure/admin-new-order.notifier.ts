import { sendNewOrderAdminEmail } from "@/services/email/client";
import type { PaidOrderDTO } from "@/modules/orders/contracts/order-payment.dto";

function mapOrderToAdminEmailPayload(order: PaidOrderDTO) {
  return {
    orderNumber: order.orderNumber,
    customerName: order.shippingName,
    customerEmail: order.user?.email ?? "—",
    customerPhone: order.shippingPhone,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingDepartment: order.shippingDepartment,
    paymentMethod: order.paymentMethod,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: Number(item.price),
      color: item.colorName,
      size: item.size,
      imageUrl: item.imageUrl ?? undefined,
    })),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shippingCost),
    discount: Number(order.discount),
    total: Number(order.total),
  };
}

/** Best effort — no revierte el PAID si falla el envío. */
export async function notifyAdminNewOrder(order: PaidOrderDTO): Promise<void> {
  try {
    await sendNewOrderAdminEmail(mapOrderToAdminEmailPayload(order));
  } catch (err) {
    console.error(
      `[admin-new-order] Error enviando aviso para orden ${order.orderNumber}:`,
      err instanceof Error ? err.message : "Error desconocido"
    );
  }
}
