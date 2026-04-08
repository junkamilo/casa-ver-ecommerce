import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/app/actions/checkout";

// ---------------------------------------------------------------------------
// Addi — Callback de resultado de aplicación de crédito
//
// Addi hace POST a esta URL cuando el crédito se resuelve (APPROVED, REJECTED…).
// Estructura del body según docs (OnlineLoanApplicationCallbackRequest):
//   { orderId, applicationId, approvedAmount, currency, status, statusTimestamp }
//
// Statuses posibles: APPROVED | PENDING | REJECTED | ABANDONED | DECLINED | INTERNAL_ERROR
//
// NOTA: La URL callbackUrl se configura en el payload de /v2/online-applications.
// En staging Addi puede no validar firma — en producción confirmar si usan HMAC.
// ---------------------------------------------------------------------------

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
  } = payload as {
    orderId?: string;
    applicationId?: string;
    status?: string;
    approvedAmount?: string;
  };

  console.log("[Addi Callback] Recibido:", { externalOrderId, applicationId, status, approvedAmount });

  if (!externalOrderId || !status) {
    return NextResponse.json(
      { error: "Faltan campos: orderId, status" },
      { status: 400 }
    );
  }

  // Registrar en WebhookLog para auditoría
  try {
    const order = await prisma.order.findUnique({
      where: { transactionId: externalOrderId },
      select: { id: true },
    });

    await prisma.webhookLog.create({
      data: {
        orderId: order?.id ?? null,
        provider: "ADDI",
        eventType: `callback.${status.toLowerCase()}`,
        payload: payload as any,
        signature: "",
        status: 200,
        attempt: 1,
      },
    });
  } catch (logErr) {
    console.error("[Addi Callback] Error registrando log:", logErr);
  }

  // Solo procesar si el crédito fue APROBADO
  if (status === "APPROVED") {
    if (!applicationId) {
      console.error("[Addi Callback] APPROVED sin applicationId");
      return NextResponse.json({ error: "applicationId requerido" }, { status: 400 });
    }

    try {
      await markOrderPaid(externalOrderId, applicationId);
      console.info("[Addi Callback] Orden marcada como pagada:", externalOrderId);
    } catch (err) {
      console.error("[Addi Callback] Error al marcar orden como pagada:", err);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  } else {
    // PENDING, REJECTED, ABANDONED, DECLINED, INTERNAL_ERROR — solo logear
    console.info(`[Addi Callback] Status no procesable: ${status} | orden: ${externalOrderId}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
