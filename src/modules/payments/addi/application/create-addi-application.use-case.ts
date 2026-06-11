import { AddiHttpClient, ADDI_TIMEOUT_MS, ADDI_CREATE_ENDPOINT } from "../infrastructure/addi-http.client";
import { PrismaAddiOrderRepository } from "../infrastructure/prisma-addi-order.repository";
import { createAddiApplicationInputSchema } from "../contracts/addi.schema";
import {
  AddiConfigError,
  AddiForbiddenError,
  AddiGatewayError,
  AddiOrderConflictError,
  AddiOrderNotFoundError,
  AddiValidationError,
} from "./addi.errors";
import type {
  CreateAddiApplicationInputDTO,
  CreateAddiApplicationResultDTO,
} from "../contracts/addi.dto";

const repository = new PrismaAddiOrderRepository();
const client = new AddiHttpClient();

// createAddiApplicationUseCase — Crea la aplicación de crédito en Addi.
//
// Reglas (preservadas byte-a-byte del POST original):
//   - orderId obligatorio (string)
//   - cedula 6–12 dígitos
//   - Si hay sesión, la orden debe pertenecer al usuario
//   - Orden debe estar PENDING y configurada como ADDI
//   - Orden debe tener transactionId y email del comprador
export async function createAddiApplicationUseCase(
  input: CreateAddiApplicationInputDTO
): Promise<CreateAddiApplicationResultDTO> {
  const apiUrl = process.env.ADDI_API_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!apiUrl || !appUrl) {
    console.error("[Addi] Variables de entorno faltantes: ADDI_API_URL o NEXT_PUBLIC_APP_URL");
    throw new AddiConfigError("Configuración de Addi incompleta");
  }

  const parsed = createAddiApplicationInputSchema.safeParse({
    orderId: input.orderId,
    cedula: input.cedula,
  });
  if (!parsed.success) {
    throw new AddiValidationError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const order = await repository.findOrderForCreateApplication(parsed.data.orderId);
  if (!order) {
    throw new AddiOrderNotFoundError("Orden no encontrada");
  }

  if (input.sessionUserId && order.userId !== input.sessionUserId) {
    console.warn("[Addi] Intento de pago con orden ajena. userId:", input.sessionUserId);
    throw new AddiForbiddenError("Acceso denegado");
  }

  if (order.status !== "PENDING") {
    throw new AddiOrderConflictError("Esta orden ya fue procesada");
  }

  if (!order.transactionId) {
    console.error("[Addi] Orden sin transactionId:", order.id);
    throw new AddiConfigError("Error interno: orden sin referencia de pago");
  }

  if (order.paymentMethod !== "ADDI") {
    throw new AddiOrderConflictError("Esta orden no está configurada para pago con Addi");
  }

  const email = order.user?.email ?? "";
  if (!email) {
    console.error("[Addi] Orden sin email de usuario:", order.id);
    throw new AddiConfigError("No se encontró el correo del comprador");
  }

  const totalAmount = Math.round(Number(order.total));
  const shippingAmount = Math.round(Number(order.shippingCost));
  const externalOrderId = order.transactionId;

  // Construir payload v1 — formato basado en el v2 que Addi sí procesaba
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
      idNumber: parsed.data.cedula,
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
    endpoint: `${apiUrl}${ADDI_CREATE_ENDPOINT}`,
  });

  let result;
  try {
    result = await client.createApplication(addiPayload, ADDI_TIMEOUT_MS);
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "";
    const isConnectedTimeout = errMsg.startsWith("ADDI_TIMEOUT:connected");
    const isNoConnectTimeout = errMsg.startsWith("ADDI_TIMEOUT:no-connect");

    if (isConnectedTimeout) {
      console.error(
        `[Addi] TIMEOUT: socket conectó pero Addi no respondió en ${ADDI_TIMEOUT_MS}ms. ` +
          `Endpoint: ${apiUrl}${ADDI_CREATE_ENDPOINT}`
      );
    } else if (isNoConnectTimeout) {
      console.error(`[Addi] TIMEOUT: socket no pudo conectar a ${apiUrl} en ${ADDI_TIMEOUT_MS}ms.`);
    } else {
      // Error de auth (token) cae aquí: getAddiToken() lanza Error.
      if (errMsg.startsWith("[Addi Auth]")) {
        console.error("[Addi] Error obteniendo token:", errMsg);
        throw new AddiGatewayError("Error de autenticación con Addi", 502);
      }
      console.error("[Addi] Error en request:", err);
    }

    throw new AddiGatewayError(
      "El servicio de Addi no está disponible. Por favor elige otro método de pago.",
      504
    );
  }

  const { status: addiStatus, location: addiLocation, body: addiBody } = result;

  console.log("[Addi] Respuesta status:", addiStatus, "| Location:", addiLocation ?? "(ninguno)");

  // Addi retorna 301/302 con Location → URL de la aplicación en su sitio
  if (addiStatus >= 300 && addiStatus < 400) {
    if (!addiLocation) {
      console.error("[Addi] Redirect sin Location header. Body:", addiBody?.slice(0, 300));
      throw new AddiGatewayError("Addi no retornó URL de redirección", 502);
    }
    console.log("[Addi] Redirigiendo usuario →", addiLocation);
    return { redirectUrl: addiLocation };
  }

  // Leer código de error del body
  let addiErrorCode: string | undefined;
  try {
    const errBody = JSON.parse(addiBody);
    addiErrorCode = errBody?.code ?? errBody?.error ?? errBody?.message ?? undefined;
  } catch {
    /* body no es JSON */
  }

  console.error(
    "[Addi] Error API:",
    addiStatus,
    addiErrorCode ? `| code: ${addiErrorCode}` : "(sin código)",
    "| body:",
    addiBody?.slice(0, 400)
  );

  if (addiStatus === 409) {
    throw new AddiOrderConflictError("Este cliente ya cuenta con un crédito activo en Addi");
  }

  if (addiStatus === 401 || addiStatus === 403) {
    console.error("[Addi] Credenciales no autorizadas para:", `${apiUrl}${ADDI_CREATE_ENDPOINT}`);
    throw new AddiGatewayError("Error de configuración con Addi. Contacta soporte.", 502);
  }

  if (addiStatus === 422 || addiStatus === 400) {
    throw new AddiGatewayError(
      `Datos inválidos para Addi${addiErrorCode ? `: ${addiErrorCode}` : ""}. Verifica tu información.`,
      422
    );
  }

  throw new AddiGatewayError(
    "El servicio de Addi no está disponible. Intenta con otro método de pago.",
    502
  );
}
