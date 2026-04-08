import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAddiToken } from "@/services/addi/auth";

// ---------------------------------------------------------------------------
// Addi — Creación de aplicación de crédito en línea
// Docs: POST /v2/online-applications
//
// Flujo:
//   1. Frontend llama POST /api/payments/addi con { orderId, payer }
//   2. Obtenemos JWT de Addi (cacheado)
//   3. POST a Addi /v2/online-applications → responde 301 con Location header
//   4. Retornamos { redirectUrl } al frontend
//   5. Frontend redirige al usuario a esa URL (sitio de Addi)
//   6. Addi envía callback POST a /api/addi/callback cuando el crédito se resuelve
// ---------------------------------------------------------------------------

interface AddiPaymentRequest {
  orderId: string; // ID interno de la orden en nuestra BD
  payer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    cedula: string;   // número de cédula
    address: string;
    city: string;
    department: string;
  };
}

export async function POST(req: NextRequest) {
  const apiUrl = process.env.ADDI_API_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!apiUrl || !appUrl) {
    return NextResponse.json(
      { error: "Configuración de Addi incompleta" },
      { status: 500 }
    );
  }

  // ── Parsear body ──────────────────────────────────────────────────────────
  let body: AddiPaymentRequest;
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

  // ── Obtener orden de la BD ────────────────────────────────────────────────
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
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

  const totalAmount = Math.round(Number(order.total));
  const shippingAmount = Math.round(Number(order.shippingCost));
  // Addi usa el transactionId como orderId externo (UUID único por orden)
  const externalOrderId = order.transactionId!;

  // ── Obtener JWT de Addi ───────────────────────────────────────────────────
  let token: string;
  try {
    token = await getAddiToken();
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[Addi] Error obteniendo token:", errMsg);
    return NextResponse.json(
      { error: "Error de autenticación con Addi", detail: errMsg },
      { status: 502 }
    );
  }

  // ── Construir payload ─────────────────────────────────────────────────────
  // Addi requiere amounts como string con decimal ("50000.0") y unitPrice como número entero.
  const fmt = (n: number) => `${Math.round(n)}.0`;

  const addiPayload = {
    orderId: externalOrderId,
    totalAmount: fmt(totalAmount),
    shippingAmount: fmt(shippingAmount),
    currency: "COP",
    items: order.items.map((item) => ({
      sku: item.sku,
      name: item.name,
      quantity: String(item.quantity),
      unitPrice: Math.round(Number(item.price)),
      category: "home",
      // pictureUrl omitido: Addi puede fallar al procesar imágenes .heic (formato Apple)
    })),
    client: {
      idType: "CC",
      idNumber: payer.cedula,
      firstName: payer.firstName,
      lastName: payer.lastName,
      email: payer.email,
      cellphone: payer.phone,
      cellphoneCountryCode: "+57",
      address: {
        lineOne: payer.address,
        city: payer.city,
        country: "CO",
      },
    },
    shippingAddress: {
      lineOne: payer.address,
      city: payer.city,
      country: "CO",
    },
    allyUrlRedirection: {
      logoUrl: `${appUrl}/logo.png`,
      callbackUrl: `${appUrl}/api/addi/callback`,
      redirectionUrl: `${appUrl}/checkout/pending?orderId=${order.id}&method=ADDI`,
    },
  };

  console.log("[Addi] Payload →", JSON.stringify(addiPayload, null, 2));

  // ── Llamar a Addi API ─────────────────────────────────────────────────────
  // redirect: "manual" para capturar el 301 y su Location header en lugar de seguirlo
  const addiRes = await fetch(`${apiUrl}/v2/online-applications`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(addiPayload),
    redirect: "manual",
  });

  console.log("[Addi] Status:", addiRes.status);

  // Addi retorna 301 con Location header apuntando a su sitio de aplicación
  if (addiRes.status === 301 || addiRes.status === 302) {
    const redirectUrl = addiRes.headers.get("location");
    if (!redirectUrl) {
      console.error("[Addi] 301 sin Location header");
      return NextResponse.json(
        { error: "Addi no retornó URL de redirección" },
        { status: 502 }
      );
    }
    console.log("[Addi] URL de redirección:", redirectUrl);
    return NextResponse.json({ redirectUrl });
  }

  // Error de Addi (4xx / 5xx)
  let errorData: unknown;
  try {
    errorData = await addiRes.json();
  } catch {
    errorData = { raw: await addiRes.text() };
  }

  if (addiRes.status === 409) {
    // El cliente ya tiene crédito en Addi
    console.warn("[Addi] Cliente con crédito existente:", errorData);
    return NextResponse.json(
      { error: "Este cliente ya cuenta con un crédito activo en Addi" },
      { status: 409 }
    );
  }

  console.error("[Addi] Error en API:", addiRes.status, errorData);
  return NextResponse.json(
    { error: "Error al crear la aplicación de crédito en Addi", details: errorData },
    { status: 502 }
  );
}
