import { enqueueOrderConfirmationEmail } from "@/lib/email-queue";
import type { PaidOrderDTO } from "@/modules/orders/contracts/order-payment.dto";

// Centraliza el mapeo de PaidOrderDTO → payload de
// enqueueOrderConfirmationEmail. Antes este bloque estaba duplicado
// byte-a-byte en 4 archivos: webhooks/bold, payments/bold/verify,
// addi/callback, webhooks/addi (más boldFallback).
//
// "Best effort" — si el correo falla NO debe revertir el PAID. Las
// llamadas siguen siendo idempotentes a través del consumer de la queue
// (verifica `confirmationEmailSentAt` antes de enviar).
//
// Si la orden no tiene email de cliente, retorna sin hacer nada (loguea).
export async function notifyOrderConfirmation(
  order: PaidOrderDTO,
  options?: { skipIfAlreadySent?: boolean }
): Promise<void> {
  const customerEmail = order.user?.email;
  if (!customerEmail) {
    console.warn(
      `[order-confirmation] Orden ${order.orderNumber} sin email de cliente — omitido`
    );
    return;
  }

  // Algunos callers (verify Bold y boldFallback) verifican confirmationEmailSentAt
  // antes de encolar para evitar trabajo innecesario. Soportamos ambos modos.
  if (options?.skipIfAlreadySent && order.confirmationEmailSentAt) {
    return;
  }

  try {
    await enqueueOrderConfirmationEmail(order.id, {
      customerEmail,
      customerName: order.shippingName,
      orderNumber: order.orderNumber,
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
    });
  } catch (emailErr) {
    console.error(
      `[order-confirmation] Error encolando email para orden ${order.orderNumber}:`,
      emailErr instanceof Error ? emailErr.message : "Error desconocido"
    );
  }
}
