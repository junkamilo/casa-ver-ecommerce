import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAddiToken } from "@/services/addi/auth";
import { auth } from "@/auth";

// ---------------------------------------------------------------------------
// Addi — Creación de aplicación de crédito en línea
// Docs: POST /v2/online-applications
//
// Flujo:
//   1. Frontend llama POST /api/payments/addi con { orderId, cedula }
//   2. Todos los datos del comprador se leen desde la BD (no se confía en el frontend)
//   3. Obtenemos JWT de Addi (cacheado)
//   4. POST a Addi /v2/online-applications → responde 301 con Location header
//   5. Retornamos { redirectUrl } al frontend
//   6. Frontend redirige al usuario a esa URL (sitio de Addi)
//   7. Addi envía callback POST a /api/addi/callback cuando el crédito se resuelve
// ---------------------------------------------------------------------------

// Regex seguros para validación de cédula
const CEDULA_REGEX = /^\d{6,12}$/;

export async function POST(req: NextRequest) {
  const apiUrl = process.env.ADDI_API_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!apiUrl || !appUrl) {
    console.error("[Addi] Variables de entorno faltantes: ADDI_API_URL o NEXT_PUBLIC_APP_URL");
    return NextResponse.json(
      { error: "Configuración de Addi incompleta" },
      { status: 500 }
    );
  }

  // ── Parsear body ──────────────────────────────────────────────────────────
  let body: { orderId?: unknown; cedula?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { orderId, cedula } = body;

  // Validar tipos y formatos básicos
  if (typeof orderId !== "string" || !orderId.trim()) {
    return NextResponse.json({ error: "orderId inválido" }, { status: 400 });
  }
  if (typeof cedula !== "string" || !CEDULA_REGEX.test(cedula)) {
    return NextResponse.json(
      { error: "Cédula inválida (6–12 dígitos numéricos)" },
      { status: 400 }
    );
  }

  // ── Verificar sesión (si el usuario está autenticado, verificar que la orden le pertenece) ──
  const session = await auth();
  const sessionUserId = (session?.user as any)?.id as string | undefined;

  // ── Obtener orden de la BD (incluye usuario e ítems) ─────────────────────
  const order = await prisma.order.findUnique({
    where: { id: orderId.trim() },
    include: {
      items: true,
      user: { select: { id: true, email: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
  }

  // Si hay sesión activa, la orden debe pertenecer a ese usuario
  if (sessionUserId && order.userId !== sessionUserId) {
    console.warn("[Addi] Intento de pago con orden ajena. userId:", sessionUserId);
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json(
      { error: "Esta orden ya fue procesada" },
      { status: 409 }
    );
  }

  if (!order.transactionId) {
    console.error("[Addi] Orden sin transactionId:", order.id);
    return NextResponse.json(
      { error: "Error interno: orden sin referencia de pago" },
      { status: 500 }
    );
  }

  if (order.paymentMethod !== "ADDI") {
    return NextResponse.json(
      { error: "Esta orden no está configurada para pago con Addi" },
      { status: 409 }
    );
  }

  // ── Construir datos del comprador desde la BD (no del frontend) ───────────
  // Solo cedula viene del frontend — los demás datos se leen de la BD para evitar
  // que un atacante con un orderId válido pueda enviar datos falsos.
  const nameParts = order.shippingName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || firstName;

  const email = order.user?.email ?? "";
  if (!email) {
    console.error("[Addi] Orden sin email de usuario:", order.id);
    return NextResponse.json(
      { error: "No se encontró el correo del comprador" },
      { status: 500 }
    );
  }

  const totalAmount = Math.round(Number(order.total));
  const shippingAmount = Math.round(Number(order.shippingCost));
  const externalOrderId = order.transactionId;

  // ── Obtener JWT de Addi ───────────────────────────────────────────────────
  let token: string;
  try {
    token = await getAddiToken();
  } catch (err) {
    console.error("[Addi] Error obteniendo token:", err instanceof Error ? err.message : "Error desconocido");
    return NextResponse.json(
      { error: "Error de autenticación con Addi" },
      { status: 502 }
    );
  }

  // ── Construir payload ─────────────────────────────────────────────────────
  // Addi requiere amounts como string con decimal ("50000.0") y unitPrice como entero.
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
      idNumber: cedula,               // único campo que viene del frontend
      firstName,                       // extraído del shippingName de la BD
      lastName,                        // extraído del shippingName de la BD
      email,                           // de la BD (user.email)
      cellphone: order.shippingPhone,  // de la BD
      cellphoneCountryCode: "+57",
      address: {
        lineOne: order.shippingAddress,   // de la BD
        city: order.shippingCity,         // de la BD
        country: "CO",
      },
    },
    shippingAddress: {
      lineOne: order.shippingAddress,  // de la BD
      city: order.shippingCity,        // de la BD
      country: "CO",
    },
    allyUrlRedirection: {
      logoUrl: `${appUrl}/logo.png`,
      callbackUrl: `${appUrl}/api/addi/callback`,
      redirectionUrl: `${appUrl}/checkout/pending?orderId=${order.id}&method=ADDI`,
    },
  };

  // Log sanitizado — sin datos personales
  console.log("[Addi] Iniciando aplicación →", {
    orderId: externalOrderId,
    orderDbId: order.id,
    totalAmount,
    itemCount: order.items.length,
  });

  // ── Llamar a Addi API ─────────────────────────────────────────────────────
  // redirect: "manual" para capturar el 301 y su Location header
  const addiRes = await fetch(`${apiUrl}/v2/online-applications`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(addiPayload),
    redirect: "manual",
  });

  console.log("[Addi] Respuesta status:", addiRes.status);

  // Addi retorna 301/302 con Location header apuntando a su sitio de aplicación
  if (addiRes.status === 301 || addiRes.status === 302) {
    const redirectUrl = addiRes.headers.get("location");
    if (!redirectUrl) {
      console.error("[Addi] Respuesta de redirección sin Location header");
      return NextResponse.json(
        { error: "Addi no retornó URL de redirección" },
        { status: 502 }
      );
    }
    return NextResponse.json({ redirectUrl });
  }

  // Error de Addi (4xx / 5xx)
  let addiErrorCode: string | undefined;
  try {
    const errBody = await addiRes.json();
    addiErrorCode = errBody?.code ?? errBody?.error ?? undefined;
    console.error("[Addi] Error API:", addiRes.status, addiErrorCode);
  } catch {
    console.error("[Addi] Error API:", addiRes.status, "(sin body JSON)");
  }

  if (addiRes.status === 409) {
    return NextResponse.json(
      { error: "Este cliente ya cuenta con un crédito activo en Addi" },
      { status: 409 }
    );
  }

  return NextResponse.json(
    { error: "Error al procesar el crédito con Addi. Intenta de nuevo." },
    { status: 502 }
  );
}