import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
// ---------------------------------------------------------------------------

const BOLD_LINK_API = "https://integrations.api.bold.co/online/link/v1";

interface BoldPaymentRequest {
  orderId: string;
  payer: {
    name: string;
    email: string;
    phone: string;
    cedula: string;
    address: string;
    addressDetail?: string;
    city: string;
    department: string;
  };
}

export async function POST(req: NextRequest) {
  // Llave de identidad → autenticación de la API Link de Pagos
  const identityKey = process.env.NEXT_PUBLIC_BOLD_IDENTITY_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!identityKey || !appUrl) {
    console.error("[BOLD] Variables faltantes:", { identityKey: !!identityKey, appUrl: !!appUrl });
    return NextResponse.json(
      { error: "Configuración de pasarela de pago incompleta" },
      { status: 500 }
    );
  }

  let body: BoldPaymentRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { orderId, payer } = body;
  if (!orderId || !payer) {
    return NextResponse.json(
      { error: "Faltan campos requeridos: orderId, payer" },
      { status: 400 }
    );
  }

  // ── Obtener la orden de la BD ─────────────────────────────────────────────
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, transactionId: true, total: true, status: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }
  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: `Orden ya procesada (estado: ${order.status})` },
      { status: 409 }
    );
  }

  const reference = order.transactionId!; // max 60 chars, UUID = 36 ✓
  const totalAmount = Math.round(Number(order.total));
  const callbackUrl = `${appUrl}/pago/resultado`;

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
    callback_url: callbackUrl,
    payer_email: payer.email,
  };

  console.log("[BOLD] Creando link de pago | reference:", reference, "| amount:", totalAmount);

  const boldRes = await fetch(BOLD_LINK_API, {
    method: "POST",
    headers: {
      Authorization: `x-api-key ${identityKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(boldBody),
  });

  const boldData = await boldRes.json();
  console.log("[BOLD] Respuesta:", boldRes.status, JSON.stringify(boldData));

  if (!boldRes.ok) {
    console.error("[BOLD] Error creando link:", boldData);
    return NextResponse.json(
      { error: "Error al crear el link de pago en Bold", details: boldData },
      { status: 502 }
    );
  }

  const paymentLink: string | undefined = boldData?.payload?.payment_link;
  const checkoutUrl: string | undefined = boldData?.payload?.url;

  if (!checkoutUrl || !paymentLink) {
    console.error("[BOLD] Respuesta sin URL o payment_link:", boldData);
    return NextResponse.json(
      { error: "Bold no retornó URL de pago" },
      { status: 502 }
    );
  }

  // ── Guardar el LNK_* en la orden para que verify lo use ──────────────────
  await prisma.order
    .update({ where: { id: orderId }, data: { boldLinkId: paymentLink } })
    .catch((e) => console.error("[BOLD] Error guardando boldLinkId:", e));

  console.log("[BOLD] Link creado:", paymentLink, "→", checkoutUrl);

  return NextResponse.json({ redirectUrl: checkoutUrl });
}
