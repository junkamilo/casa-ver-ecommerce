import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/app/actions/checkout";
import { enqueueOrderConfirmationEmail } from "@/lib/email-queue";

// ---------------------------------------------------------------------------
// Bold Fallback — Consulta directa al estado del pago en Bold
//
// Propósito: plan B si el webhook de Bold no llega.
// Busca órdenes PENDING con más de 3 minutos, consulta Bold y actualiza.
//
// Llamado por el cron definido en vercel.json (cada 10 minutos).
// También puede llamarse manualmente: GET /api/admin/bold-fallback
//
// Autorización:
//   - Vercel cron envía automáticamente: Authorization: Bearer {CRON_SECRET}
//   - También acepta BOLD_FALLBACK_SECRET para compatibilidad y llamadas manuales
//   - En desarrollo se permite sin autenticación
//
// Endpoint de consulta Bold:
//   GET /payments/webhook/notifications/{reference}?is_external_reference=true
//   Authorization: x-api-key {API_KEY}
// ---------------------------------------------------------------------------

const BOLD_API_BASE = "https://api.online.payments.bold.co";
const PENDING_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutos

function isAuthorized(req: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") return true;

  const authorization = req.headers.get("authorization");
  if (!authorization) return false;

  // Vercel cron usa CRON_SECRET automáticamente
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authorization === `Bearer ${cronSecret}`) return true;

  // Compatibilidad con llamadas manuales autenticadas
  const fallbackSecret = process.env.BOLD_FALLBACK_SECRET;
  if (fallbackSecret && authorization === `Bearer ${fallbackSecret}`) return true;

  return false;
}

async function queryBoldByReference(transactionId: string): Promise<{
  status?: string;
  boldPaymentId?: string;
  error?: string;
}> {
  // BOLD_IDENTITY_KEY es server-side únicamente — NUNCA usar NEXT_PUBLIC_ para llaves privadas de API
  const apiKey = process.env.BOLD_IDENTITY_KEY;
  if (!apiKey) return { error: "BOLD_IDENTITY_KEY no configurada" };

  try {
    const url = `${BOLD_API_BASE}/payments/webhook/notifications/${encodeURIComponent(transactionId)}?is_external_reference=true`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `x-api-key ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      return { error: `Bold API ${response.status}: ${body.slice(0, 200)}` };
    }

    const data = await response.json();

    const status =
      data?.data?.status ??
      data?.status ??
      data?.payload?.status;

    const boldPaymentId =
      data?.data?.id ??
      data?.id ??
      data?.payload?.id;

    return { status, boldPaymentId };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error de red" };
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - PENDING_THRESHOLD_MS);

  const pendingOrders = await prisma.order.findMany({
    where: {
      status: "PENDING",
      paymentMethod: "BOLD",
      transactionId: { not: null },
      createdAt: { lt: cutoff },
    },
    select: {
      id: true,
      orderNumber: true,
      transactionId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  if (pendingOrders.length === 0) {
    return NextResponse.json({ checked: 0, updated: 0 });
  }

  console.log(`[BOLD FALLBACK] Revisando ${pendingOrders.length} órdenes PENDING...`);

  const results = {
    checked: pendingOrders.length,
    updated: 0,
    errors: 0,
    details: [] as { orderId: string; orderNumber: string; boldStatus?: string; action: string }[],
  };

  for (const order of pendingOrders) {
    if (!order.transactionId) continue;

    const { status, boldPaymentId, error } = await queryBoldByReference(order.transactionId);

    if (error) {
      results.errors++;
      results.details.push({ orderId: order.id, orderNumber: order.orderNumber, action: `error: ${error}` });
      continue;
    }

    const statusUpper = status?.toUpperCase();

    if (statusUpper === "PAID" || statusUpper === "APPROVED") {
      try {
        // boldPaymentId debe venir de Bold; si no, usar un prefijo descriptivo para auditoría
        const resolvedPaymentId = boldPaymentId ?? `bold-fallback-${order.transactionId}`;
        const paidOrder = await markOrderPaid(order.transactionId, resolvedPaymentId);
        results.updated++;
        results.details.push({ orderId: order.id, orderNumber: order.orderNumber, boldStatus: status, action: "marked_paid" });
        console.log(`[BOLD FALLBACK] Orden ${order.orderNumber} marcada como PAID`);

        // Enviar email de confirmación — "best effort"
        if (!paidOrder.confirmationEmailSentAt && paidOrder.user?.email) {
          try {
            await enqueueOrderConfirmationEmail(paidOrder.id, {
              customerEmail: paidOrder.user.email,
              customerName: paidOrder.shippingName,
              orderNumber: paidOrder.orderNumber,
              items: paidOrder.items.map((item) => ({
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
    } else if (statusUpper === "REJECTED" || statusUpper === "CANCELLED" || statusUpper === "EXPIRED") {
      await prisma.order
        .updateMany({
          where: { id: order.id, status: "PENDING" },
          data: { status: "FAILED" },
        })
        .catch(() => null);
      results.updated++;
      results.details.push({ orderId: order.id, orderNumber: order.orderNumber, boldStatus: status, action: "marked_failed" });
    } else {
      results.details.push({ orderId: order.id, orderNumber: order.orderNumber, boldStatus: status ?? "unknown", action: "no_action" });
    }
  }

  console.log("[BOLD FALLBACK] Resultado:", { checked: results.checked, updated: results.updated, errors: results.errors });

  return NextResponse.json(results);
}