import "server-only";
import type { z } from "zod";
import {
  posCategorySchema,
  posColorFacetSchema,
  posEnvelopeSchema,
  posOrderCancelResultSchema,
  posOrderResultSchema,
  posOrderStatusSchema,
  posCustomerOrderSchema,
  posIssuedCodeSchema,
  posOrderSummarySchema,
  posPageSchema,
  posProductSchema,
  posPromotionValidationSchema,
  posStockCheckSchema,
  type PosCategory,
  type PosColorFacet,
  type PosCustomerOrder,
  type PosIssuedCode,
  type PosOrderQuery,
  type PosOrderSummary,
  type PosPromotionValidateRequest,
  type PosPromotionValidation,
  type PosOrderLine,
  type PosOrderPayload,
  type PosOrderStatus,
  type PosOrderStatusUpdate,
  type PosStockCheck,
  type PosOrderResult,
  type PosProduct,
  type PosProductQuery,
} from "../contracts/pos-catalog.schema";
import {
  posGeoItemSchema,
  posShippingQuoteSchema,
  type PosGeoItem,
  type PosShippingQuote,
} from "../contracts/pos-shipping.schema";
import {
  posWebAdminSchema,
  posWebAdminVerificationSchema,
  type PosWebAdmin,
  type PosWebAdminVerification,
} from "../contracts/pos-admin.schema";
import { getPosApiConfig } from "./pos-config";

const REQUEST_TIMEOUT_MS = 8_000;
const MAX_RETRY_AFTER_SECONDS = 30;
const MAX_ATTEMPTS = 3;
const PAGE_SIZE = 100;

export class PosApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "PosApiError";
  }
}

export { isPosCatalogConfigured } from "./pos-config";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function parseRetryAfter(header: string | null): number {
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds, MAX_RETRY_AFTER_SECONDS);
  const date = header ? Date.parse(header) : NaN;
  if (Number.isFinite(date)) {
    return Math.min(Math.max(0, (date - Date.now()) / 1000), MAX_RETRY_AFTER_SECONDS);
  }
  return 5;
}

/**
 * GET a la API pública del POS. Devuelve `null` en 404 (recurso inexistente u oculto).
 * `root = "public"`: rutas fuera del catálogo (POS_API_BASE_URL apunta a /api/public/catalog).
 */
async function request<T extends z.ZodTypeAny>(
  path: string,
  dataSchema: T,
  query?: Record<string, string | number | string[] | undefined>,
  root: "catalog" | "public" = "catalog",
): Promise<z.infer<T> | null> {
  const { baseUrl, apiKey } = getPosApiConfig();
  const base = root === "public" ? baseUrl.replace(/\/catalog$/, "") : baseUrl;
  const url = new URL(`${base}${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, v));
    else if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await fetch(url, {
      method: "GET",
      headers: { "X-Api-Key": apiKey, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status === 404) return null;

    if (response.status === 429 && attempt < MAX_ATTEMPTS) {
      const waitSeconds = parseRetryAfter(response.headers.get("retry-after"));
      console.warn(`[POS API] 429 en ${path}; reintento en ${waitSeconds}s`);
      await sleep(waitSeconds * 1000);
      continue;
    }

    if (response.status === 401) {
      console.error("[POS API] 401: POS_API_KEY ausente o inválida");
      throw new PosApiError("Clave de integración del POS inválida", 401);
    }

    if (!response.ok) {
      throw new PosApiError(`POS respondió ${response.status} en ${path}`, response.status);
    }

    const json = await response.json();
    const envelope = posEnvelopeSchema.safeParse(json);
    const parsed = envelope.success ? dataSchema.safeParse(envelope.data.data) : envelope;
    if (!parsed.success) {
      throw new PosApiError(
        `Respuesta inesperada del POS en ${path}: ${parsed.error.issues[0]?.message ?? "formato inválido"}`,
        502,
      );
    }
    return parsed.data as z.infer<T>;
  }

  throw new PosApiError(`POS limitó las peticiones en ${path}`, 429);
}

export async function listCategories(updatedSince?: string): Promise<PosCategory[]> {
  const data = await request("/categories", posCategorySchema.array(), { updatedSince });
  return data ?? [];
}

/** Colores activos del POS (`GET /colors`). Lanza si el POS falla (el caso de uso decide el respaldo). */
export async function listColors(): Promise<PosColorFacet[]> {
  const data = await request("/colors", posColorFacetSchema.array());
  return data ?? [];
}

export async function getCategory(webId: string): Promise<PosCategory | null> {
  return request(`/categories/${encodeURIComponent(webId)}`, posCategorySchema);
}

export async function listProductsPage(query: PosProductQuery = {}) {
  const data = await request("/products", posPageSchema(posProductSchema), {
    categoryWebId: query.categoryWebId,
    subcategoryWebId: query.subcategoryWebId,
    updatedSince: query.updatedSince,
    page: query.page ?? 0,
    size: query.size ?? PAGE_SIZE,
  });
  return data ?? { items: [], total: 0, page: query.page ?? 0, size: query.size ?? PAGE_SIZE };
}

/** Recorre todas las páginas de `/products`. */
export async function listProducts(
  query: Omit<PosProductQuery, "page" | "size"> = {},
): Promise<PosProduct[]> {
  const all: PosProduct[] = [];
  for (let page = 0; ; page++) {
    const result = await listProductsPage({ ...query, page, size: PAGE_SIZE });
    all.push(...result.items);
    if (result.items.length === 0 || all.length >= result.total) break;
  }
  return all;
}

export async function getProduct(slug: string): Promise<PosProduct | null> {
  return request(`/products/${encodeURIComponent(slug)}`, posProductSchema);
}

/**
 * Pedidos web del POS (GET /api/public/orders): estado logístico, guía, fechas, destinatario y prendas.
 * El POS es la única fuente de verdad de la logística; la web no la guarda. Lanza si el POS no responde.
 */
export async function listPosOrders(query: PosOrderQuery = {}): Promise<{ items: PosCustomerOrder[]; total: number }> {
  const data = await request(
    "/orders",
    posPageSchema(posCustomerOrderSchema),
    {
      customerEmail: query.customerEmail,
      documentNumber: query.documentNumber,
      orderNumber: query.orderNumbers,
      fulfillmentStatus: query.fulfillmentStatuses?.join(","),
      deliveredBefore: query.deliveredBefore,
      from: query.from,
      to: query.to,
      page: query.page ?? 0,
      size: query.size ?? PAGE_SIZE,
    },
    "public",
  );
  return { items: data?.items ?? [], total: data?.total ?? 0 };
}

/** Pedidos por estado logístico y días entre el pago y la entrega (fechas `YYYY-MM-DD`, opcionales). */
export async function getPosOrderSummary(from?: string, to?: string): Promise<PosOrderSummary | null> {
  return request("/orders/summary", posOrderSummarySchema, { from, to }, "public");
}

/**
 * Precio de envío (GET /api/public/shipping/quote) por código DANE del municipio o por ciudad y departamento.
 * `subtotal`: subtotal neto (después del cupón) para el envío gratis. El POS es la única fuente de las
 * tarifas, la cobertura y el envío gratis. Lanza si el POS no responde.
 */
export async function quotePosShipping(query: {
  municipality?: string;
  city?: string;
  department?: string;
  subtotal: number;
}): Promise<PosShippingQuote> {
  const data = await request(
    "/shipping/quote",
    posShippingQuoteSchema,
    {
      municipality: query.municipality,
      city: query.city,
      department: query.department,
      subtotal: Math.max(0, Math.round(query.subtotal)),
    },
    "public",
  );
  if (!data) throw new PosApiError("El POS no publica el precio de envío", 404);
  return data;
}

/** Departamentos activos de un país (ISO alpha-2), con su código DANE. */
export async function listPosDepartments(countryIso = "CO"): Promise<PosGeoItem[]> {
  return (await request(`/geography/countries/${encodeURIComponent(countryIso)}/departments`, posGeoItemSchema.array(), undefined, "public")) ?? [];
}

/** Municipios con cobertura de un departamento (código DANE de 2 dígitos). */
export async function listPosMunicipalities(departmentDane: string): Promise<PosGeoItem[]> {
  return (await request(`/geography/departments/${encodeURIComponent(departmentDane)}/municipalities`, posGeoItemSchema.array(), undefined, "public")) ?? [];
}

/**
 * Administradores de la web según el POS (Configuraciones → Usuarios). `null` si el POS aún no publica
 * administradores (404). El login usa esta lista para saber si un correo es de un admin.
 */
export async function listWebAdmins(): Promise<PosWebAdmin[] | null> {
  return request("/admins", posWebAdminSchema.array(), undefined, "public");
}

/**
 * ¿Es correcta la contraseña de este admin? La verifica el POS (el hash no sale de allá). `clientIp`:
 * IP del visitante, para el límite de intentos fallidos. 429 = bloqueado temporalmente por intentos.
 */
export async function verifyWebAdmin(
  email: string,
  password: string,
  clientIp?: string | null,
): Promise<PosWebAdminVerification> {
  const { baseUrl, apiKey } = getPosApiConfig();
  const url = `${baseUrl.replace(/\/catalog$/, "")}/admins/verify`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "X-Api-Key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password, clientIp: clientIp ?? undefined }),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status === 429) throw new PosApiError("Demasiados intentos; espera unos minutos", 429);
  if (response.status === 401) throw new PosApiError("Clave de integración del POS inválida", 401);
  // 400: datos que el POS rechaza (p. ej. contraseña de más de 100 caracteres) = credenciales inválidas.
  if (response.status === 400) return { valid: false, admin: null };
  if (!response.ok) throw new PosApiError(`POS respondió ${response.status} en /admins/verify`, response.status);
  const json = await response.json().catch(() => null);
  const parsed = posWebAdminVerificationSchema.safeParse(json?.data);
  if (!parsed.success) throw new PosApiError("Respuesta inesperada del POS en /admins/verify", 502);
  return parsed.data;
}

/** Resultado de reportar un pedido: registrado (o ya estaba) o rechazado por el POS con su motivo. */
export type PosOrderOutcome =
  | { status: "registered"; result: PosOrderResult }
  | { status: "rejected"; httpStatus: number; message: string };

type PosPostResult =
  | { ok: true; data: unknown }
  | { ok: false; httpStatus: number; message: string };

/**
 * POST a /api/public/... (pedidos, cupones) con reintentos ante 429. 2xx y 4xx (rechazo definitivo) se
 * devuelven; 401, 5xx y errores de red se lanzan para reintentar después.
 */
async function postToPublic(path: string, body: unknown): Promise<PosPostResult> {
  const { baseUrl, apiKey } = getPosApiConfig();
  // POS_API_BASE_URL apunta a /api/public/catalog; pedidos y cupones van en /api/public/orders y /promotions.
  const url = `${baseUrl.replace(/\/catalog$/, "")}${path}`;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "X-Api-Key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status === 429 && attempt < MAX_ATTEMPTS) {
      await sleep(parseRetryAfter(response.headers.get("retry-after")) * 1000);
      continue;
    }

    const json = await response.json().catch(() => null);
    if (response.ok) return { ok: true, data: json?.data };
    if (response.status === 401) throw new PosApiError("Clave de integración del POS inválida", 401);
    if (response.status >= 400 && response.status < 500 && response.status !== 429) {
      const details = Array.isArray(json?.details) && json.details.length > 0 ? ` (${json.details.join("; ")})` : "";
      return {
        ok: false,
        httpStatus: response.status,
        message: `${json?.message ?? `POS respondió ${response.status}`}${details}`,
      };
    }
    throw new PosApiError(`POS respondió ${response.status} en ${path}`, response.status);
  }

  throw new PosApiError(`POS limitó las peticiones en ${path}`, 429);
}

const postToOrders = (path: string, body: unknown) => postToPublic(`/orders${path}`, body);

/**
 * Valida un cupón para el carrito (POST /api/public/promotions/validate): el POS calcula el descuento y
 * dice a qué líneas aplica. No registra el uso (eso pasa con el pedido pagado). Un cupón que no aplica
 * vuelve con `valid = false` y su mensaje; lanza si el POS no responde.
 */
export async function validatePosPromotion(body: PosPromotionValidateRequest): Promise<PosPromotionValidation> {
  const result = await postToPublic("/promotions/validate", body);
  if (!result.ok) throw new PosApiError(result.message, result.httpStatus);
  const parsed = posPromotionValidationSchema.safeParse(result.data);
  if (!parsed.success) throw new PosApiError("Respuesta inesperada del POS en /promotions/validate", 502);
  return parsed.data;
}

/**
 * Pide al POS el cupón de bienvenida de un correo (POST /api/public/promotions/{promotionId}/codes). Si el
 * correo ya tenía uno, el POS devuelve el mismo. Lanza si el POS lo rechaza o no responde.
 */
export async function issuePosPromotionCode(promotionId: string, email: string): Promise<PosIssuedCode> {
  const result = await postToPublic(`/promotions/${encodeURIComponent(promotionId)}/codes`, { email });
  if (!result.ok) throw new PosApiError(result.message, result.httpStatus);
  const parsed = posIssuedCodeSchema.safeParse(result.data);
  if (!parsed.success) throw new PosApiError("Respuesta inesperada del POS en /promotions/{id}/codes", 502);
  return parsed.data;
}

/**
 * Reporta un pedido pagado (POST /api/public/orders). El POS lo registra como venta y descuenta
 * inventario; repetirlo es seguro (idempotente por número de pedido). 4xx = rechazo definitivo
 * (stock insuficiente, producto desconocido); errores de red o 5xx se lanzan para reintentar.
 */
export async function postOrder(payload: PosOrderPayload): Promise<PosOrderOutcome> {
  const result = await postToOrders("", payload);
  if (!result.ok) return { status: "rejected", httpStatus: result.httpStatus, message: result.message };
  const parsed = posOrderResultSchema.safeParse(result.data);
  return { status: "registered", result: parsed.success ? parsed.data : { replay: false } };
}

/**
 * Antes de crear el pedido: ¿alcanza el inventario del POS para estas cantidades? (POST /orders/check).
 * No reserva nada. Lanza si el POS no responde (quien llama decide si confía en su copia local).
 */
export async function checkPosStock(lines: PosOrderLine[]): Promise<PosStockCheck> {
  const result = await postToOrders("/check", { lines });
  if (!result.ok) throw new PosApiError(result.message, result.httpStatus);
  const parsed = posStockCheckSchema.safeParse(result.data);
  if (!parsed.success) throw new PosApiError("Respuesta inesperada del POS en /orders/check", 502);
  return parsed.data;
}

/**
 * Avisa al POS que un pedido pagado se canceló o reembolsó: anula su venta y devuelve inventario y
 * caja. Idempotente. Si el pedido nunca llegó al POS responde `SIN_PEDIDO`.
 */
export async function postOrderCancellation(
  orderNumber: string,
  body: { reason: string; refunded: boolean },
): Promise<{ status: string; saleNumber: string | null; replay: boolean }> {
  const result = await postToOrders(`/${encodeURIComponent(orderNumber)}/cancel`, body);
  if (!result.ok) throw new PosApiError(result.message, result.httpStatus);
  const parsed = posOrderCancelResultSchema.safeParse(result.data);
  if (!parsed.success) return { status: "ANULADA", saleNumber: null, replay: false };
  return { status: parsed.data.status, saleNumber: parsed.data.saleNumber ?? null, replay: parsed.data.replay };
}

/**
 * Estado del pedido en el POS (GET /api/public/orders/{orderNumber}), con su estado logístico.
 * `null` si el pedido no está en el POS (404).
 */
export async function getPosOrderStatus(orderNumber: string): Promise<PosOrderStatus | null> {
  const { baseUrl, apiKey } = getPosApiConfig();
  const url = `${baseUrl.replace(/\/catalog$/, "")}/orders/${encodeURIComponent(orderNumber)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { "X-Api-Key": apiKey, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status === 404) return null;
  if (response.status === 401) throw new PosApiError("Clave de integración del POS inválida", 401);
  if (!response.ok) throw new PosApiError(`POS respondió ${response.status} en /orders/${orderNumber}`, response.status);
  const json = await response.json().catch(() => null);
  const parsed = posOrderStatusSchema.safeParse(json?.data);
  if (!parsed.success) throw new PosApiError("Respuesta inesperada del POS en /orders/{pedido}", 502);
  return parsed.data;
}

/**
 * Reporta al POS un cambio de estado hecho en la web (POST /orders/{orderNumber}/status). El POS no
 * lo reenvía y no retrocede el pedido con un aviso viejo. `null` si el pedido no está en el POS.
 */
export async function postOrderStatus(
  orderNumber: string,
  body: PosOrderStatusUpdate,
): Promise<PosOrderStatus | null> {
  const result = await postToOrders(`/${encodeURIComponent(orderNumber)}/status`, body);
  if (!result.ok) {
    if (result.httpStatus === 404) return null;
    throw new PosApiError(result.message, result.httpStatus);
  }
  const parsed = posOrderStatusSchema.safeParse(result.data);
  return parsed.success ? parsed.data : null;
}
