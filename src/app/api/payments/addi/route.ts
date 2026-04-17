import https from "https";
import http from "http";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAddiToken } from "@/services/addi/auth";
import { auth } from "@/auth";

// ---------------------------------------------------------------------------
// Addi — Creación de aplicación de crédito en línea
// Endpoint: POST /v1/online-applications  (no /v2 — no activado en cuentas custom)
//
// Fuente: AdelanteFinancialHoldings/addi-magento2 (implementación oficial)
//
// Flujo:
//   1. Frontend llama POST /api/payments/addi con { orderId, cedula }
//   2. Datos del comprador se leen desde la BD
//   3. Obtenemos JWT de Addi (OAuth2 client_credentials, cacheado)
//   4. POST a Addi /v1/online-applications → responde 301 con Location header
//   5. Retornamos { redirectUrl } al frontend
//   6. Frontend redirige al usuario a la URL de Addi
//   7. Addi envía callback POST a /api/addi/callback cuando el crédito se resuelve
//
// NOTA: Usamos https/http nativos de Node en lugar de fetch() porque
// fetch() con redirect:"manual" en Node.js/undici devuelve opaque-redirect
// (status 0, headers vacíos), impidiendo leer el Location header del 301.
// ---------------------------------------------------------------------------

const CEDULA_REGEX = /^\d{6,12}$/;
const ADDI_TIMEOUT_MS = 15_000;
const ADDI_ENDPOINT = "/v1/online-applications";

// Hace un POST sin seguir redirects y devuelve status + Location + body raw.
function addiPost(
  url: string,
  token: string,
  bodyStr: string,
  timeoutMs: number
): Promise<{ status: number; location: string | null; body: string }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const isHttps = parsed.protocol === "https:";
    const lib = isHttps ? https : http;

    const options: https.RequestOptions = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? "443" : "80"),
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Content-Length": String(Buffer.byteLength(bodyStr)),
      },
    };

    let socketConnected = false;
    const startTime = Date.now();

    const req = lib.request(options, (res) => {
      let data = "";
      res.on("data", (chunk: Buffer) => { data += chunk.toString(); });
      res.on("end", () => {
        const rawLoc = res.headers["location"];
        const location = Array.isArray(rawLoc) ? rawLoc[0] : (rawLoc ?? null);
        resolve({ status: res.statusCode ?? 0, location, body: data });
      });
      res.on("error", reject);
    });

    req.on("socket", (socket) => {
      socket.on("connect", () => {
        socketConnected = true;
        console.log(`[Addi] Socket TCP conectado en ${Date.now() - startTime}ms`);
      });
      socket.on("secureConnect", () => {
        console.log(`[Addi] TLS handshake completo en ${Date.now() - startTime}ms`);
      });
    });

    req.setTimeout(timeoutMs, () => {
      const msg = socketConnected ? "ADDI_TIMEOUT:connected" : "ADDI_TIMEOUT:no-connect";
      req.destroy(new Error(msg));
    });

    req.on("error", (err) => {
      console.error(`[Addi] Error de socket (${Date.now() - startTime}ms):`, err.message);
      reject(err);
    });
    req.write(bodyStr);
    req.end();
  });
}

export async function POST(req: NextRequest) {
  const apiUrl = process.env.ADDI_API_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!apiUrl || !appUrl) {
    console.error("[Addi] Variables de entorno faltantes: ADDI_API_URL o NEXT_PUBLIC_APP_URL");
    return NextResponse.json({ error: "Configuración de Addi incompleta" }, { status: 500 });
  }

  // ── Parsear body ──────────────────────────────────────────────────────────
  let body: { orderId?: unknown; cedula?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { orderId, cedula } = body;

  if (typeof orderId !== "string" || !orderId.trim()) {
    return NextResponse.json({ error: "orderId inválido" }, { status: 400 });
  }
  if (typeof cedula !== "string" || !CEDULA_REGEX.test(cedula)) {
    return NextResponse.json(
      { error: "Cédula inválida (6–12 dígitos numéricos)" },
      { status: 400 }
    );
  }

  // ── Verificar sesión ──────────────────────────────────────────────────────
  const session = await auth();
  const sessionUserId = (session?.user as any)?.id as string | undefined;

  // ── Obtener orden de la BD ────────────────────────────────────────────────
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

  if (sessionUserId && order.userId !== sessionUserId) {
    console.warn("[Addi] Intento de pago con orden ajena. userId:", sessionUserId);
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  if (order.status !== "PENDING") {
    return NextResponse.json({ error: "Esta orden ya fue procesada" }, { status: 409 });
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

  // ── Preparar datos del comprador ──────────────────────────────────────────
  const email = order.user?.email ?? "";
  if (!email) {
    console.error("[Addi] Orden sin email de usuario:", order.id);
    return NextResponse.json({ error: "No se encontró el correo del comprador" }, { status: 500 });
  }

  const totalAmount    = Math.round(Number(order.total));
  const shippingAmount = Math.round(Number(order.shippingCost));
  const externalOrderId = order.transactionId;

  // ── Obtener JWT de Addi ───────────────────────────────────────────────────
  let token: string;
  try {
    token = await getAddiToken();
  } catch (err) {
    console.error("[Addi] Error obteniendo token:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Error de autenticación con Addi" }, { status: 502 });
  }

  // ── Construir payload v1 ──────────────────────────────────────────────────
  // Formato basado en el payload v2 que Addi sí procesaba (generaba DECLINED/REJECTED
  // vía webhook), confirma que este esquema es el correcto para esta cuenta.
  const fmt = (n: number) => `${Math.round(n)}.0`;
  const nameParts = order.shippingName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || firstName;

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
    })),
    client: {
      idType: "CC",
      idNumber: cedula,
      firstName,
      lastName,
      email,
      cellphone: order.shippingPhone.replace(/^\+?57/, "").replace(/\D/g, ""),
      cellphoneCountryCode: "+57",
      address: {
        lineOne: order.shippingAddress,
        city: order.shippingCity,
        country: "CO",
      },
    },
    shippingAddress: {
      lineOne: order.shippingAddress,
      city: order.shippingCity,
      country: "CO",
    },
    allyUrlRedirection: {
      logoUrl: `${appUrl}/logo.png`,
      // La clave secreta en la URL garantiza que solo Addi (que conoce esta URL exacta)
      // pueda disparar el callback. Sin ella, cualquiera podría aprobar órdenes sin pagar.
      callbackUrl: process.env.ADDI_CALLBACK_SECRET
        ? `${appUrl}/api/addi/callback?key=${encodeURIComponent(process.env.ADDI_CALLBACK_SECRET)}`
        : `${appUrl}/api/addi/callback`,
      redirectionUrl: `${appUrl}/checkout/pending?orderId=${order.id}&method=ADDI`,
    },
  };


  console.log("[Addi] Iniciando aplicación v1 →", {
    orderId: externalOrderId,
    orderDbId: order.id,
    totalAmount,
    itemCount: order.items.length,
    endpoint: `${apiUrl}${ADDI_ENDPOINT}`,
  });

  // ── Llamar a Addi API ─────────────────────────────────────────────────────
  let addiStatus: number;
  let addiLocation: string | null;
  let addiBody: string;

  try {
    const result = await addiPost(
      `${apiUrl}${ADDI_ENDPOINT}`,
      token,
      JSON.stringify(addiPayload),
      ADDI_TIMEOUT_MS
    );
    addiStatus = result.status;
    addiLocation = result.location;
    addiBody = result.body;
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "";
    const isConnectedTimeout = errMsg.startsWith("ADDI_TIMEOUT:connected");
    const isNoConnectTimeout = errMsg.startsWith("ADDI_TIMEOUT:no-connect");

    if (isConnectedTimeout) {
      console.error(
        `[Addi] TIMEOUT: socket conectó pero Addi no respondió en ${ADDI_TIMEOUT_MS}ms. ` +
        `Endpoint: ${apiUrl}${ADDI_ENDPOINT}`
      );
    } else if (isNoConnectTimeout) {
      console.error(`[Addi] TIMEOUT: socket no pudo conectar a ${apiUrl} en ${ADDI_TIMEOUT_MS}ms.`);
    } else {
      console.error("[Addi] Error en request:", err);
    }

    return NextResponse.json(
      { error: "El servicio de Addi no está disponible. Por favor elige otro método de pago." },
      { status: 504 }
    );
  }

  console.log("[Addi] Respuesta status:", addiStatus, "| Location:", addiLocation ?? "(ninguno)");

  // Addi retorna 301/302 con Location header → URL de la aplicación en su sitio
  if (addiStatus >= 300 && addiStatus < 400) {
    if (!addiLocation) {
      console.error("[Addi] Redirect sin Location header. Body:", addiBody?.slice(0, 300));
      return NextResponse.json({ error: "Addi no retornó URL de redirección" }, { status: 502 });
    }
    console.log("[Addi] Redirigiendo usuario →", addiLocation);
    return NextResponse.json({ redirectUrl: addiLocation });
  }

  // Leer código de error del body
  let addiErrorCode: string | undefined;
  try {
    const errBody = JSON.parse(addiBody);
    addiErrorCode = errBody?.code ?? errBody?.error ?? errBody?.message ?? undefined;
  } catch { /* body no es JSON */ }

  console.error(
    "[Addi] Error API:", addiStatus,
    addiErrorCode ? `| code: ${addiErrorCode}` : "(sin código)",
    "| body:", addiBody?.slice(0, 400)
  );

  if (addiStatus === 409) {
    return NextResponse.json(
      { error: "Este cliente ya cuenta con un crédito activo en Addi" },
      { status: 409 }
    );
  }

  if (addiStatus === 401 || addiStatus === 403) {
    console.error("[Addi] Credenciales no autorizadas para:", `${apiUrl}${ADDI_ENDPOINT}`);
    return NextResponse.json(
      { error: "Error de configuración con Addi. Contacta soporte." },
      { status: 502 }
    );
  }

  if (addiStatus === 422 || addiStatus === 400) {
    return NextResponse.json(
      { error: `Datos inválidos para Addi${addiErrorCode ? `: ${addiErrorCode}` : ""}. Verifica tu información.` },
      { status: 422 }
    );
  }

  return NextResponse.json(
    { error: "El servicio de Addi no está disponible. Intenta con otro método de pago." },
    { status: 502 }
  );
}
