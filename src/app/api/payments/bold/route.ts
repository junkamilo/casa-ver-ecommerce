import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// ---------------------------------------------------------------------------
// Bold — API Link de Pagos
// Base URL: https://integrations.api.bold.co
// Auth:     Authorization: x-api-key <LLAVE_DE_IDENTIDAD>
//
// Flujo:
//   1. POST /online/link/v1  → crea el link de pago, devuelve { url: "https://checkout.bold.co/LNK_..." }
//   2. Redirigimos al usuario a esa URL → Bold maneja el pago completo
//   3. Bold redirige de vuelta a /pago/resultado con ?bold-order-id=...
//   4. /api/payments/bold/verify consulta GET /online/link/v1/{LNK_...} para el estado
//
// Seguridad:
//   - Solo acepta orderId del frontend — todos los datos del comprador se leen desde la BD
//   - Si hay sesión activa, verifica que la orden pertenezca al usuario autenticado
//   - transactionId validado antes de usarlo
// ---------------------------------------------------------------------------

const BOLD_LINK_API = "https://integrations.api.bold.co/online/link/v1";

export async function POST(req: NextRequest) {
  // BOLD_IDENTITY_KEY es server-side únicamente — NUNCA usar NEXT_PUBLIC_ para llaves privadas de API
  const identityKey = process.env.BOLD_IDENTITY_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!identityKey || !appUrl) {
    console.error("[BOLD] Variables faltantes:", { BOLD_IDENTITY_KEY: !!identityKey, appUrl: !!appUrl });
    return NextResponse.json(
      { error: "Configuración de pasarela de pago incompleta" },
      { status: 500 }
    );
  }

  // ── Parsear body ──────────────────────────────────────────────────────────
  let body: { orderId?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { orderId } = body;
  if (typeof orderId !== "string" || !orderId.trim()) {
    return NextResponse.json({ error: "orderId inválido" }, { status: 400 });
  }

  // ── Verificar sesión (si hay sesión, la orden debe pertenecer al usuario) ─
  const session = await auth();
  const sessionUserId = (session?.user as any)?.id as string | undefined;

  // ── Obtener la orden de la BD (incluye usuario) ───────────────────────────
  const order = await prisma.order.findUnique({
    where: { id: orderId.trim() },
    select: {
      id: true,
      transactionId: true,
      total: true,
      status: true,
      paymentMethod: true,
      userId: true,
      user: { select: { email: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  // Verificar propiedad si hay sesión activa
  if (sessionUserId && order.userId !== sessionUserId) {
    console.warn("[BOLD] Intento de pago con orden ajena. userId:", sessionUserId);
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Esta orden ya fue procesada" },
      { status: 409 }
    );
  }

  if (order.paymentMethod !== "BOLD") {
    return NextResponse.json(
      { error: "Esta orden no está configurada para pago con Bold" },
      { status: 409 }
    );
  }

  if (!order.transactionId) {
    console.error("[BOLD] Orden sin transactionId:", order.id);
    return NextResponse.json(
      { error: "Error interno: orden sin referencia de pago" },
      { status: 500 }
    );
  }

  const reference = order.transactionId; // UUID 36 chars ≤ 60 máx de Bold ✓
  const totalAmount = Math.round(Number(order.total));
  const payerEmail = order.user?.email ?? "";

  // ── Crear Link de Pago en Bold ────────────────────────────────────────────
  const boldBody = {
    amount_type: "CLOSE",
    amount: {
      currency: "COP",
      total_amount: totalAmount,
      tip_amount: 0,
    },
    reference,
    description: "Compra en Casa Verde",
    callback_url: `${appUrl}/pago/resultado`,
    ...(payerEmail ? { payer_email: payerEmail } : {}),
  };

  console.log("[BOLD] Creando link | reference:", reference, "| amount:", totalAmount);

  const boldRes = await fetch(BOLD_LINK_API, {
    method: "POST",
    headers: {
      Authorization: `x-api-key ${identityKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(boldBody),
  });

  if (!boldRes.ok) {
    let errCode: string | undefined;
    try {
      const errBody = await boldRes.json();
      errCode = errBody?.code ?? errBody?.message ?? undefined;
    } catch { /* sin body JSON */ }
    console.error("[BOLD] Error creando link:", boldRes.status, errCode);
    return NextResponse.json(
      { error: "Error al crear el link de pago. Intenta de nuevo." },
      { status: 502 }
    );
  }

  const boldData = await boldRes.json();
  const paymentLink: string | undefined = boldData?.payload?.payment_link;
  const checkoutUrl: string | undefined = boldData?.payload?.url;

  if (!checkoutUrl || !paymentLink) {
    console.error("[BOLD] Respuesta sin URL o payment_link");
    return NextResponse.json(
      { error: "Bold no retornó URL de pago" },
      { status: 502 }
    );
  }

  // ── Guardar el LNK_* en la orden — CRÍTICO: verify lo necesita para consultar Bold ──
  try {
    await prisma.order.update({ where: { id: order.id }, data: { boldLinkId: paymentLink } });
  } catch (e) {
    console.error("[BOLD] Error guardando boldLinkId — la verificación del pago fallará:", e);
    return NextResponse.json(
      { error: "Error al registrar el link de pago. Intenta de nuevo." },
      { status: 500 }
    );
  }

  console.log("[BOLD] Link creado:", paymentLink);

  return NextResponse.json({ redirectUrl: checkoutUrl });
}