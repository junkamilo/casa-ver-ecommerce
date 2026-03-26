import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const BOLD_LINK_API = "https://integrations.api.bold.co/online/link/v1";

// ---------------------------------------------------------------------------
// POST /api/payments/bold
//
// Recibe:  { orderId, payer }
// Ejecuta: POST Bold Link de Pagos → obtiene checkout URL
// Retorna: { redirectUrl }
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  // La API de Link de Pagos (integrations.api.bold.co) requiere la llave de identidad.
  // NEXT_PUBLIC_BOLD_IDENTITY_KEY es accesible desde el servidor aunque tenga el prefijo.
  const apiKey =
    process.env.BOLD_IDENTITY_KEY ?? process.env.NEXT_PUBLIC_BOLD_IDENTITY_KEY;
  if (!apiKey) {
    console.error("[BOLD] BOLD_IDENTITY_KEY (o NEXT_PUBLIC_BOLD_IDENTITY_KEY) no configurada");
    return NextResponse.json(
      { error: "Pasarela de pago no configurada" },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_APP_URL no configurada" },
      { status: 500 }
    );
  }

  let body: {
    orderId: string;
    payer: { name: string; email: string; phone: string; cedula: string };
  };

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

  // Obtener la orden de la BD
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

  const reference = order.transactionId!;
  const totalAmount = Math.round(Number(order.total));

  // ── Crear Link de Pago en Bold ─────────────────────────────────────────────
  const boldBody = {
    amount_type: "CLOSE",
    amount: {
      currency: "COP",
      total_amount: totalAmount,
      tip_amount: 0,
    },
    reference,
    description: "Compra en Casa Verde",
    callback_url: `${appUrl}/pago/resultado?reference_id=${reference}`,
  };

  console.log("[BOLD] Creando link de pago para orden:", orderId);

  const boldRes = await fetch(BOLD_LINK_API, {
    method: "POST",
    headers: {
      Authorization: `x-api-key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(boldBody),
  });

  const boldData = await boldRes.json();
  console.log("[BOLD] Respuesta Bold status:", boldRes.status);

  if (!boldRes.ok) {
    console.error("[BOLD] Error creando link:", boldData);
    return NextResponse.json(
      { error: "Error creando link de pago en Bold", details: boldData },
      { status: 502 }
    );
  }

  const paymentLink: string | undefined = boldData?.payload?.payment_link;
  const redirectUrl: string | undefined = boldData?.payload?.url;

  console.log("[BOLD] payment_link (LNK_*):", paymentLink);
  console.log("[BOLD] URL de redirección:", redirectUrl);

  if (!redirectUrl) {
    console.error("[BOLD] Bold no retornó URL de pago. Payload:", boldData);
    return NextResponse.json(
      { error: "Bold no retornó URL de pago" },
      { status: 502 }
    );
  }

  // Guardar LNK_* en la orden para poder consultar el estado después
  if (paymentLink) {
    await prisma.order
      .update({
        where: { id: orderId },
        data: { boldLinkId: paymentLink },
      })
      .catch((e) => console.error("[BOLD] Error guardando boldLinkId:", e));
  }

  return NextResponse.json({ redirectUrl });
}
