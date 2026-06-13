import { verifyAddiCallbackKey } from "../infrastructure/addi-callback-key.verifier";
import { PrismaAddiOrderRepository } from "../infrastructure/prisma-addi-order.repository";
import {
  isValidApplicationId,
  isValidCallbackStatus,
  isValidOrderId,
} from "../contracts/addi.schema";
import { mapCallbackStatusToOrderStatus } from "../domain/addi-status.entity";
import { AddiUnauthorizedError, AddiValidationError } from "./addi.errors";
import { WebhookLogRepository } from "@/modules/payments/shared/infrastructure/webhook-log.repository";
import { markOrderPaidUseCase } from "@/modules/orders/application/mark-order-paid.use-case";
import { releaseOrderStockUseCase } from "@/modules/orders/application/release-order-stock.use-case";
import type { AddiCallbackInputDTO, AddiCallbackResultDTO } from "../contracts/addi.dto";

const repository = new PrismaAddiOrderRepository();
const webhookLogs = new WebhookLogRepository();

// processAddiCallbackUseCase — Procesa el callback POST de Addi.
//
// 1. Valida la clave del query param ?key= (timing-safe).
// 2. Valida campos del payload (orderId UUID, status enum).
// 3. Busca orden + valida monto (tolerancia 100 COP) si APPROVED.
// 4. Registra en WebhookLog con dedup por (orderId, eventType).
// 5. Procesa según estado:
//    - APPROVED  → markOrderPaid + email
//    - REJECTED/DECLINED/INTERNAL_ERROR → releaseStock(FAILED)
//    - ABANDONED → releaseStock(CANCELLED)
//    - PENDING   → no acción
//
// Errores devuelven status apropiado vía el sufijo de error-response.
// El caller (route handler) responde 200 al final, salvo que se lance.
export async function processAddiCallbackUseCase(
  input: AddiCallbackInputDTO
): Promise<AddiCallbackResultDTO> {
  if (!verifyAddiCallbackKey(input.providedKey)) {
    throw new AddiUnauthorizedError();
  }

  const {
    orderId: externalOrderId,
    applicationId,
    status,
    approvedAmount,
  } = input.payload as Record<string, unknown>;

  if (!isValidOrderId(externalOrderId)) {
    console.warn("[Addi Callback] orderId inválido o ausente:", externalOrderId);
    throw new AddiValidationError("orderId inválido");
  }

  if (!isValidCallbackStatus(status)) {
    console.warn("[Addi Callback] status inválido:", status);
    throw new AddiValidationError("status inválido");
  }

  const normalizedStatus = (status as string).toUpperCase();

  console.log("[Addi Callback] Recibido:", {
    orderId: externalOrderId,
    applicationId: typeof applicationId === "string" ? applicationId : "(ausente)",
    status: normalizedStatus,
    approvedAmount,
  });

  // Buscar la orden una sola vez con todos los campos necesarios
  let orderRecord: { id: string; total: unknown; status: string } | null = null;
  try {
    orderRecord = await repository.findOrderByTransactionIdForCallback(externalOrderId);
  } catch (lookupErr) {
    console.error("[Addi Callback] Error buscando orden:", lookupErr);
  }

  // Registrar en WebhookLog con deduplicación
  let logEntry: { id: string } | undefined;
  try {
    const eventType = `callback.${normalizedStatus.toLowerCase()}`;
    const alreadyLogged = orderRecord
      ? await webhookLogs.findExistingByOrderAndEvent(orderRecord.id, eventType)
      : null;

    if (!alreadyLogged) {
      logEntry = await webhookLogs.create({
        orderId: orderRecord?.id ?? null,
        provider: "ADDI",
        eventType,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload: input.payload as any,
        signature: "",
        status: 200,
        attempt: 1,
      });
    } else {
      console.info(
        `[Addi Callback] Callback ${normalizedStatus} duplicado ignorado para orden: ${orderRecord!.id}`
      );
    }
  } catch (logErr) {
    console.error("[Addi Callback] Error registrando log:", logErr);
  }

  // Procesar según estado
  if (normalizedStatus === "APPROVED") {
    if (!isValidApplicationId(applicationId)) {
      console.error("[Addi Callback] APPROVED sin applicationId válido:", applicationId);
      throw new AddiValidationError("applicationId requerido y válido");
    }

    // Validar que el monto aprobado coincida con el total de la orden.
    // Protege contra manipulación donde alguien aprueba un monto menor al real.
    if (orderRecord) {
      const expectedTotal = Number(orderRecord.total);
      const receivedAmount =
        typeof approvedAmount === "number"
          ? approvedAmount
          : typeof approvedAmount === "string"
            ? parseFloat(approvedAmount)
            : NaN;

      if (!isNaN(receivedAmount) && receivedAmount < expectedTotal - 100) {
        console.error(
          `[Addi Callback] Monto aprobado insuficiente. Esperado: ${expectedTotal} COP, ` +
            `Recibido: ${receivedAmount} COP. orderId: ${externalOrderId}`
        );
        if (logEntry) {
          await webhookLogs
            .update({
              id: logEntry.id,
              status: 422,
              errorMessage: `Monto insuficiente: esperado ${expectedTotal}, recibido ${receivedAmount}`,
            })
            .catch(() => {});
        }
        // Retornamos 200 para que Addi no reintente — el problema no es transitorio.
        // El admin debe investigar manualmente vía WebhookLog.
        return { received: true };
      }
    }

    try {
      await markOrderPaidUseCase(externalOrderId, (applicationId as string).trim());
      console.info("[Addi Callback] Orden marcada como pagada:", externalOrderId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error("[Addi Callback] Error al marcar orden como pagada:", errorMessage);

      if (logEntry) {
        await webhookLogs
          .update({ id: logEntry.id, status: 500, errorMessage })
          .catch(() => {});
      }

      // Lanzar para que el route handler retorne 500 → Addi reintenta el callback.
      throw new Error("Error interno");
    }
  } else if (normalizedStatus !== "PENDING") {
    // REJECTED / DECLINED / ABANDONED / INTERNAL_ERROR
    const newStatus = mapCallbackStatusToOrderStatus(normalizedStatus);

    if (newStatus) {
      await releaseOrderStockUseCase(externalOrderId, newStatus);
      console.info(
        `[Addi Callback] ${normalizedStatus} → releaseOrderStock(${newStatus}): ${externalOrderId}`
      );
    }
  } else {
    // PENDING — Addi sigue procesando, no acción.
    console.info(`[Addi Callback] Estado PENDING recibido para orden: ${externalOrderId}`);
  }

  return { received: true };
}
