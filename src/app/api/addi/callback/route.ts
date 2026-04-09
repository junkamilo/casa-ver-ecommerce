import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/app/actions/checkout";
import { sendOrderConfirmationEmail } from "@/services/email/client";

// ---------------------------------------------------------------------------
// Addi — Callback de resultado de aplicación de crédito
//
// Addi hace POST a esta URL cuando el crédito se resuelve (APPROVED, REJECTED…).
// Estructura del body según docs (OnlineLoanApplicationCallbackRequest):
//   { orderId, applicationId, approvedAmount, currency, status, statusTimestamp }
//
// Statuses posibles: APPROVED | PENDING | REJECTED | ABANDONED | DECLINED | INTERNAL_ERROR
//
// Seguridad:
// - `orderId` debe ser un UUID válido (transactionId generado por nosotros con randomUUID)
// - `applicationId` debe existir y tener longitud razonable
// - `markOrderPaid` es idempotente — si la orden ya está PAID, no hace nada
// - Todos los errores internos devuelven 200 a Addi para evitar reintentos infinitos
// ---------------------------------------------------------------------------

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidOrderId(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

function isValidApplicationId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= 4 && value.trim().length <= 128;
}

function isValidStatus(value: unknown): value is string {
  return (
    typeof value === "string" &&
    ["APPROVED", "PENDING", "REJECTED", "ABANDONED", "DECLINED", "INTERNAL_ERROR"].includes(
      value.toUpperCase()
    )
  );
}

export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>;

  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    orderId: externalOrderId,
    applicationId,
    status,
    approvedAmount,
  } = payload as Record<string, unknown>;

  // Validar campos requeridos con formatos esperados
  if (!isValidOrderId(externalOrderId)) {
    console.warn("[Addi Callback] orderId inválido o ausente:", externalOrderId);
    return NextResponse.json({ error: "orderId inválido" }, { status: 400 });
  }

  if (!isValidStatus(status)) {
    console.warn("[Addi Callback] status inválido:", status);
    return NextResponse.json({ error: "status inválido" }, { status: 400 });
  }

  const normalizedStatus = (status as string).toUpperCase();

  console.log("[Addi Callback] Recibido:", {
    orderId: externalOrderId,
    applicationId: typeof applicationId === "string" ? applicationId : "(ausente)",
    status: normalizedStatus,
    approvedAmount,
  });

  // Registrar en WebhookLog para auditoría (antes de cualquier procesamiento)
  let logEntry: { id: string } | undefined;
  try {
    const order = await prisma.order.findUnique({
      where: { transactionId: externalOrderId },
      select: { id: true },
    });

    logEntry = await prisma.webhookLog.create({
      data: {
        orderId: order?.id ?? null,
        provider: "ADDI",
        eventType: `callback.${normalizedStatus.toLowerCase()}`,
        payload: payload as any,
        signature: "",
        status: 200,
        attempt: 1,
      },
    });
  } catch (logErr) {
    console.error("[Addi Callback] Error registrando log:", logErr);
    // No bloqueamos el procesamiento si falla el log
  }

  // Solo procesar si el crédito fue APROBADO
  if (normalizedStatus === "APPROVED") {
    if (!isValidApplicationId(applicationId)) {
      console.error("[Addi Callback] APPROVED sin applicationId válido:", applicationId);
      return NextResponse.json({ error: "applicationId requerido y válido" }, { status: 400 });
    }

    try {
      const order = await markOrderPaid(externalOrderId, applicationId.trim());
      console.info("[Addi Callback] Orden marcada como pagada:", order.orderNumber);

      // Enviar email de confirmación — "best effort": si falla no revertimos PAID
      if (order.user?.email) {
        try {
          const emailResult = await sendOrderConfirmationEmail({
            customerEmail: order.user.email,
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

          if (emailResult.success) {
            await prisma.order.update({
              where: { id: order.id },
              data: { confirmationEmailSentAt: new Date() },
            });
            console.info("[Addi Callback] Email de confirmación enviado:", order.orderNumber);
          } else {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                confirmationEmailFailedAt: new Date(),
                confirmationEmailError: emailResult.error ?? "Error desconocido",
              },
            });
            console.warn("[Addi Callback] Email falló:", emailResult.error);
          }
        } catch (emailErr) {
          console.error("[Addi Callback] Error enviando email:", emailErr);
          await prisma.order
            .update({
              where: { id: order.id },
              data: {
                confirmationEmailFailedAt: new Date(),
                confirmationEmailError:
                  emailErr instanceof Error ? emailErr.message : "Error desconocido",
              },
            })
            .catch(() => {});
        }
      } else {
        console.warn("[Addi Callback] Orden sin email de cliente:", externalOrderId);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      console.error("[Addi Callback] Error al marcar orden como pagada:", errorMessage);

      if (logEntry) {
        await prisma.webhookLog
          .update({
            where: { id: logEntry.id },
            data: { status: 500, errorMessage },
          })
          .catch(() => {});
      }

      // Retornamos 500 para que Addi reintente el callback
      return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
  } else {
    // PENDING, REJECTED, ABANDONED, DECLINED, INTERNAL_ERROR — solo logear
    console.info(
      `[Addi Callback] Estado no procesable: ${normalizedStatus} | orden: ${externalOrderId}`
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}