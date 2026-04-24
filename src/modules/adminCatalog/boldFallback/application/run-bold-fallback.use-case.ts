import { BoldPaymentService } from "../infrastructure/bold-payment.service";
import { PrismaOrderFallbackRepository } from "../infrastructure/prisma-order-fallback.repository";
import { BOLD_PENDING_THRESHOLD_MS, determineOrderActionFromBoldStatus } from "../domain/bold-fallback.entity";
import { BoldFallbackUnauthorizedError, BoldFallbackConfigError } from "./bold-fallback.errors";
import type { BoldFallbackResponseDTO, RunBoldFallbackInputDTO } from "../contracts/bold-fallback.dto";

import { enqueueOrderConfirmationEmail } from "@/lib/email-queue";
import { markOrderPaidUseCase } from "@/modules/adminCatalog/orders/application/mark-order-paid.use-case";

const fallbackRepository = new PrismaOrderFallbackRepository();
const boldService = new BoldPaymentService();

export async function runBoldFallbackUseCase(input: RunBoldFallbackInputDTO): Promise<BoldFallbackResponseDTO> {
  // 1. Lógica de Autorización
  const isAuthorized =
    input.isDev ||
    (input.cronSecret && input.authorizationHeader === `Bearer ${input.cronSecret}`) ||
    (input.fallbackSecret && input.authorizationHeader === `Bearer ${input.fallbackSecret}`);

  if (!isAuthorized) {
    throw new BoldFallbackUnauthorizedError();
  }

  if (!input.boldApiKey) {
    throw new BoldFallbackConfigError("BOLD_IDENTITY_KEY no configurada");
  }

  // 2. Obtener órdenes
  const pendingOrders = await fallbackRepository.getPendingBoldOrders(BOLD_PENDING_THRESHOLD_MS);

  if (pendingOrders.length === 0) {
    return { checked: 0, updated: 0, errors: 0, details: [] };
  }

  console.log(`[BOLD FALLBACK] Revisando ${pendingOrders.length} órdenes PENDING...`);

  const results: BoldFallbackResponseDTO = {
    checked: pendingOrders.length,
    updated: 0,
    errors: 0,
    details: [],
  };

  // 3. Procesamiento
  for (const order of pendingOrders) {
    if (!order.transactionId) continue;

    const { status, boldPaymentId, error } = await boldService.queryByReference(order.transactionId, input.boldApiKey);

    if (error) {
      results.errors++;
      results.details.push({ orderId: order.id, orderNumber: order.orderNumber, action: `error: ${error}` });
      continue;
    }

    const decision = determineOrderActionFromBoldStatus(status);

    if (decision === "MARK_PAID") {
      try {
        const resolvedPaymentId = boldPaymentId ?? `bold-fallback-${order.transactionId}`;
        const paidOrder = await markOrderPaidUseCase(order.transactionId, resolvedPaymentId);
        
        results.updated++;
        results.details.push({ orderId: order.id, orderNumber: order.orderNumber, boldStatus: status, action: "marked_paid" });
        console.log(`[BOLD FALLBACK] Orden ${order.orderNumber} marcada como PAID`);

        // Notificación email "best effort"
        if (!paidOrder.confirmationEmailSentAt && paidOrder.user?.email) {
          try {
            await enqueueOrderConfirmationEmail(paidOrder.id, {
              customerEmail: paidOrder.user.email,
              customerName: paidOrder.shippingName,
              orderNumber: paidOrder.orderNumber,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              items: paidOrder.items.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                price: Number(item.price),
                color: item.colorName,
                size: item.size,
                imageUrl: item.imageUrl ?? undefined,
              })),
              subtotal: Number(paidOrder.subtotal),
              shippingCost: Number(paidOrder.shippingCost),
              discount: Number(paidOrder.discount),
              total: Number(paidOrder.total),
            });
          } catch (emailErr) {
            console.error("[BOLD FALLBACK] Error encolando email:", emailErr);
          }
        }
      } catch (err) {
        results.errors++;
        const msg = err instanceof Error ? err.message : "Error desconocido";
        results.details.push({ orderId: order.id, orderNumber: order.orderNumber, boldStatus: status, action: `error_marking_paid: ${msg}` });
      }
      
    } else if (decision === "MARK_FAILED") {
      await fallbackRepository.markOrderFailed(order.id).catch(() => null);
      results.updated++;
      results.details.push({ orderId: order.id, orderNumber: order.orderNumber, boldStatus: status, action: "marked_failed" });
      
    } else {
      results.details.push({ orderId: order.id, orderNumber: order.orderNumber, boldStatus: status ?? "unknown", action: "no_action" });
    }
  }

  console.log("[BOLD FALLBACK] Resultado:", { checked: results.checked, updated: results.updated, errors: results.errors });
  return results;
}