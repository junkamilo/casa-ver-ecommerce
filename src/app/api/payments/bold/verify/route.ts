import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/app/actions/checkout";
import { sendOrderConfirmationEmail } from "@/services/email/client";

const BOLD_LINK_API = "https://integrations.api.bold.co/online/link/v1";

// ---------------------------------------------------------------------------
// GET /api/payments/bold/verify?reference_id=...
//
// Bold redirige al cliente a /pago/resultado?reference_id={transactionId}
// Esta ruta busca la orden por transactionId, obtiene el boldLinkId (LNK_*)
// y consulta el estado del link en Bold.
//
// Statuses Bold Link de Pagos:
//   ACTIVE    → link creado, pago no completado
//   PROCESSING→ pago en curso
//   PAID      → pago exitoso ✅
//   REJECTED  → pago rechazado
//   CANCELLED → cancelado por el usuario
//   EXPIRED   → link vencido
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const referenceId = req.nextUrl.searchParams.get("reference_id");
  if (!referenceId) {
    return NextResponse.json(
      { error: "reference_id requerido" },
      { status: 400 }
    );
  }

  // BOLD_IDENTITY_KEY es server-side únicamente — NUNCA usar NEXT_PUBLIC_ para llaves privadas de API
  const apiKey = process.env.BOLD_IDENTITY_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "BOLD_IDENTITY_KEY no configurada" },
      { status: 500 }
    );
  }

  console.log("[BOLD CALLBACK] reference_id recibido:", referenceId);

  // Buscar la orden por transactionId para obtener el boldLinkId
  const order = await prisma.order.findUnique({
    where: { transactionId: referenceId },
    select: { id: true, boldLinkId: true, status: true },
  });

  if (!order) {
    console.error("[BOLD CALLBACK] Orden no encontrada para transactionId:", referenceId);
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  // Si ya está pagada (webhook llegó antes que el redirect), retornar directo
  if (order.status === "PAID") {
    console.log("[BOLD CALLBACK] Orden ya marcada como PAID (webhook adelantado)");
    return NextResponse.json({ status: "APPROVED", orderId: order.id });
  }

  if (!order.boldLinkId) {
    // Órdenes de Bold Botón de Pagos no tienen boldLinkId.
    // El webhook actualizará el estado cuando Bold confirme — devolver RUNNING
    // para que el polling en /pago/resultado siga esperando.
    console.log("[BOLD CALLBACK] Orden sin boldLinkId (Bold Botón de Pagos) — esperando webhook, devolviendo RUNNING");
    return NextResponse.json({ status: "RUNNING", orderId: order.id });
  }

  console.log("[BOLD CALLBACK] Consultando link:", order.boldLinkId);

  // Consultar estado del link en Bold
  const boldRes = await fetch(`${BOLD_LINK_API}/${encodeURIComponent(order.boldLinkId)}`, {
    headers: { Authorization: `x-api-key ${apiKey}` },
    cache: "no-store",
  });

  if (!boldRes.ok) {
    const body = await boldRes.text();
    console.error("[BOLD CALLBACK] Error Bold API:", boldRes.status, body.slice(0, 200));
    return NextResponse.json(
      { error: `Bold API ${boldRes.status}` },
      { status: 502 }
    );
  }

  const data = await boldRes.json();
  console.log("[BOLD CALLBACK] Estado del link recibido:", { status: data?.status ?? data?.payload?.status });

  // Bold Link de Pagos puede retornar status en raíz o en payload — verificar ambos
  const boldStatus = (
    (data.status ?? data.payload?.status ?? "UNKNOWN") as string
  ).toUpperCase();
  const uiStatus = boldStatus === "PAID" ? "APPROVED" : boldStatus;

  if (boldStatus === "PAID") {
    try {
      // data.payment_id / data.transaction_id = ID real de la transacción Bold (preferido)
      // data.id         = LNK_* (ID del link, NO es el payment ID — último recurso)
      const boldPaymentId =
        (data.payment_id as string | undefined) ??
        (data.transaction_id as string | undefined) ??
        (data.id as string | undefined) ??
        order.boldLinkId ??
        `bold-verify-${referenceId}`;
      const paidOrder = await markOrderPaid(referenceId, boldPaymentId);

      // Enviar email de confirmación si no fue enviado aún (puede llegar antes que el webhook)
      if (!paidOrder.confirmationEmailSentAt && paidOrder.user?.email) {
        try {
          const emailResult = await sendOrderConfirmationEmail({
            customerEmail: paidOrder.user.email,
            customerName: paidOrder.shippingName,
            orderNumber: paidOrder.orderNumber,
            items: paidOrder.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: Number(item.price),
              color: item.colorName,
              size: item.size,
              imageUrl: item.imageUrl,
            })),
            subtotal: Number(paidOrder.subtotal),
            shippingCost: Number(paidOrder.shippingCost),
            discount: Number(paidOrder.discount),
            total: Number(paidOrder.total),
          });

          await prisma.order.update({
            where: { id: paidOrder.id },
            data: emailResult.success
              ? { confirmationEmailSentAt: new Date() }
              : { confirmationEmailFailedAt: new Date(), confirmationEmailError: emailResult.error ?? "Error desconocido" },
          });
        } catch (emailErr) {
          console.error("[BOLD CALLBACK] Error enviando email:", emailErr);
        }
      }
    } catch (e) {
      // Idempotente: si ya está pagado no es un error real
      console.warn("[BOLD CALLBACK] markOrderPaid (posiblemente idempotente):", e);
    }
  } else if (
    boldStatus === "REJECTED" ||
    boldStatus === "CANCELLED" ||
    boldStatus === "EXPIRED"
  ) {
    await prisma.order
      .updateMany({
        where: { transactionId: referenceId, status: "PENDING" },
        data: { status: "FAILED" },
      })
      .catch((e) =>
        console.error("[BOLD CALLBACK] Error actualizando orden a FAILED:", e)
      );
  }

  return NextResponse.json({ status: uiStatus, orderId: order.id });
}
