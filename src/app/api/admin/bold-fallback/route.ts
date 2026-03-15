import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { markOrderPaid } from "@/app/actions/checkout";

// ---------------------------------------------------------------------------
// Bold Fallback — Consulta directa al estado del pago en Bold
//
// Propósito: plan B si el webhook no llega.
// Busca órdenes PENDING con más de 3 minutos, consulta Bold y actualiza.
//
// Llamado por el cron definido en vercel.json (cada 5 minutos).
// También puede llamarse manualmente: GET /api/admin/bold-fallback
//
// Endpoint de consulta Bold:
//   GET /payments/webhook/notifications/{reference}?is_external_reference=true
//   Authorization: x-api-key {API_KEY}
//
// Referencia de estados del link (GET /online/link/v1/{id}):
//   ACTIVE      → No pagado
//   PROCESSING  → Pago en curso
//   PAID        → Pago exitoso ✅
//   REJECTED    → Pago rechazado
//   CANCELLED   → Cancelado
//   EXPIRED     → Link vencido
// ---------------------------------------------------------------------------

const BOLD_API_BASE = "https://api.online.payments.bold.co";
const PENDING_THRESHOLD_MS = 3 * 60 * 1000; // 3 minutos

// Clave secreta para proteger el endpoint (evita que cualquiera lo llame)
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.BOLD_FALLBACK_SECRET;
  // Si no está configurada, sólo se permite en desarrollo
  if (!secret) return process.env.NODE_ENV === "development";

  const authorization = req.headers.get("authorization");
  return authorization === `Bearer ${secret}`;
}

// ---------------------------------------------------------------------------
// Consulta el estado de una orden en Bold usando la referencia externa
// ---------------------------------------------------------------------------
async function queryBoldByReference(transactionId: string): Promise<{
  status?: string;
  boldPaymentId?: string;
  error?: string;
}> {
  const apiKey = process.env.NEXT_PUBLIC_BOLD_IDENTITY_KEY;
  if (!apiKey) return { error: "NEXT_PUBLIC_BOLD_IDENTITY_KEY no configurada" };

  try {
    // Opción 1: usar el endpoint de notificaciones por referencia externa
    const url = `${BOLD_API_BASE}/payments/webhook/notifications/${encodeURIComponent(transactionId)}?is_external_reference=true`;

    console.log("[BOLD FALLBACK] Consultando link:", transactionId);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `x-api-key ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[BOLD FALLBACK] Error Bold API: ${response.status} ${body}`);
      return { error: `Bold API ${response.status}: ${body.slice(0, 200)}` };
    }

    const data = await response.json();
    console.log("[BOLD FALLBACK] Respuesta de Bold:", JSON.stringify(data, null, 2));

    // La respuesta puede ser una notificación o el estado del link
    // Intentamos ambas estructuras
    const status =
      data?.data?.status ??
      data?.status ??
      data?.payload?.status;

    const boldPaymentId =
      data?.data?.id ??
      data?.id ??
      data?.payload?.id;

    console.log("[BOLD FALLBACK] Estado actual:", status);

    return { status, boldPaymentId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[BOLD FALLBACK] Error de red:", message);
    return { error: message };
  }
}

// ---------------------------------------------------------------------------
// GET handler — cron o llamada manual
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - PENDING_THRESHOLD_MS);

  // Buscar órdenes PENDING con más de 3 minutos de antigüedad
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
    take: 50, // procesar máximo 50 por ejecución
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
        await markOrderPaid(order.transactionId, boldPaymentId ?? "fallback");
        results.updated++;
        results.details.push({ orderId: order.id, orderNumber: order.orderNumber, boldStatus: status, action: "marked_paid" });
        console.log(`[BOLD FALLBACK] ✓ Orden ${order.orderNumber} marcada como PAID (fallback)`);
      } catch (err) {
        results.errors++;
        const msg = err instanceof Error ? err.message : "Error desconocido";
        results.details.push({ orderId: order.id, orderNumber: order.orderNumber, boldStatus: status, action: `error_marking_paid: ${msg}` });
      }
    } else if (statusUpper === "REJECTED" || statusUpper === "CANCELLED" || statusUpper === "EXPIRED") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      }).catch(() => null);
      results.updated++;
      results.details.push({ orderId: order.id, orderNumber: order.orderNumber, boldStatus: status, action: "marked_failed" });
    } else {
      results.details.push({ orderId: order.id, orderNumber: order.orderNumber, boldStatus: status ?? "unknown", action: "no_action" });
    }
  }

  console.log("[BOLD FALLBACK] Resultado:", results);

  return NextResponse.json(results);
}
