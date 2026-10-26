import type { PosOrderPayload, PosProduct } from "../contracts/pos-catalog.schema";

export type WebSize = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "ONESIZE";

// El POS no envía cantidades. El checkout reserva contra `stock - reserved`, así que se
// traduce la disponibilidad a un stock nominal: el POS sigue siendo quien decide.
export const POS_STOCK_AVAILABLE = 99;
export const POS_STOCK_LOW = 2;

const DEFAULT_HEX = "#CCCCCC";
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

const SIZE_ALIASES: Record<string, WebSize> = {
  XS: "XS",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
  XXL: "XXL",
  "2XL": "XXL",
  U: "ONESIZE",
  UNICA: "ONESIZE",
  "TALLA UNICA": "ONESIZE",
  ONESIZE: "ONESIZE",
  "ONE SIZE": "ONESIZE",
  STD: "ONESIZE",
  ESTANDAR: "ONESIZE",
};

export function mapPosSize(name: string | null | undefined): WebSize | null {
  const key = String(name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
  return SIZE_ALIASES[key] ?? null;
}

export function stockForAvailability(available: boolean, lowStock: boolean): number {
  if (!available) return 0;
  return lowStock ? POS_STOCK_LOW : POS_STOCK_AVAILABLE;
}

export function normalizeHex(hex: string | null | undefined): string {
  const value = String(hex ?? "").trim();
  if (HEX_RE.test(value)) return value.toUpperCase();
  if (/^[0-9A-Fa-f]{6}$/.test(value)) return `#${value.toUpperCase()}`;
  return DEFAULT_HEX;
}

export function buildPosVariantSku(posSlug: string, colorId: number | null, sizeId: number | null): string {
  return `pos-${posSlug}-${colorId ?? "x"}-${sizeId ?? "x"}`;
}

export function resolveComparePrice(salePrice: number, displayPrice: number | null): number | null {
  if (displayPrice == null || !Number.isFinite(displayPrice)) return null;
  return displayPrice > salePrice ? displayPrice : null;
}

// ── Producto ─────────────────────────────────────────────────────────────────

export interface MappedPosImage {
  url: string;
  isCover: boolean;
  order: number;
  /** Texto alternativo publicado por el POS; `null` en respuestas de un POS anterior a V106. */
  altText: string | null;
}

export interface MappedPosVariant {
  size: WebSize;
  sku: string;
  posAvailable: boolean;
  posLowStock: boolean;
  stock: number;
}

export interface MappedPosColor {
  name: string;
  hexCode: string;
  images: MappedPosImage[];
  variants: MappedPosVariant[];
}

/** Banderas de vitrina de la web que vienen de las etiquetas del POS. */
export interface MappedPosLabels {
  isFeatured: boolean;
  isProductNew: boolean;
  isProductNewAt: Date | null;
  isSuggested: boolean;
  suggestedAt: Date | null;
  /** Etiqueta ON_SALE del POS. Sin ella, la oferta manual de la web se respeta (ver repositorio). */
  isOnSale: boolean;
  isOnSaleAt: Date | null;
}

export interface MappedPosProduct {
  posSlug: string;
  name: string;
  description: string;
  basePrice: number;
  comparePrice: number | null;
  videoUrl: string | null;
  coverImageUrl: string | null;
  /** webIds de todas las categorías y subcategorías donde se ubica (principal + adicionales). */
  categoryWebIds: string[];
  /** Tipos de prenda de sus ubicaciones (filtro ?tipo=). */
  garmentTypeSlugs: string[];
  labels: MappedPosLabels;
  colors: MappedPosColor[];
  /** Variantes descartadas (color o talla sin equivalente en la web). */
  skipped: string[];
}

/** El POS publica el slug en minúsculas; los guardados antes iban en mayúsculas. */
export function normalizePosSlug(slug: string): string {
  return slug.trim().toLowerCase();
}

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function mapPosLabels(labels: PosProduct["labels"]): MappedPosLabels {
  const byCode = new Map(labels.map((l) => [l.code.toUpperCase(), l]));
  const productNew = byCode.get("PRODUCT_NEW");
  const suggested = byCode.get("SUGGEST_POPUP");
  const onSale = byCode.get("ON_SALE");
  return {
    isFeatured: byCode.has("BEST_SELLER"),
    isProductNew: Boolean(productNew),
    isProductNewAt: productNew ? (parseDate(productNew.assignedAt) ?? new Date()) : null,
    isSuggested: Boolean(suggested),
    suggestedAt: suggested ? (parseDate(suggested.assignedAt) ?? new Date()) : null,
    isOnSale: Boolean(onSale),
    isOnSaleAt: onSale ? (parseDate(onSale.assignedAt) ?? new Date()) : null,
  };
}

function uniqueStrings(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))];
}

function uniqueColorName(name: string, used: Set<string>): string {
  const base = name.trim() || "Color";
  let candidate = base;
  for (let i = 2; used.has(candidate.toLowerCase()); i++) candidate = `${base} ${i}`;
  used.add(candidate.toLowerCase());
  return candidate;
}

export function mapPosProduct(pos: PosProduct): MappedPosProduct {
  const skipped: string[] = [];
  const sizeById = new Map<number | null, WebSize | null>(
    pos.sizes.map((s) => [s.sizeId, mapPosSize(s.name)]),
  );
  const sizeNameById = new Map(pos.sizes.map((s) => [s.sizeId, s.name]));

  const usedNames = new Set<string>();
  const colorsById = new Map<number | null, MappedPosColor>();
  const colors: MappedPosColor[] = [];

  for (const color of pos.colors) {
    const images = color.media
      .filter((m) => !m.video)
      .map((m, index) => ({ url: m.url, isCover: m.cover, order: index, altText: m.alt?.trim() || null }));
    const mapped: MappedPosColor = {
      name: uniqueColorName(color.name, usedNames),
      hexCode: normalizeHex(color.hexCode),
      images,
      variants: [],
    };
    colorsById.set(color.colorId, mapped);
    colors.push(mapped);
  }

  for (const variant of pos.variants) {
    const color = colorsById.get(variant.colorId);
    if (!color) {
      skipped.push(`color ${variant.colorId} sin definir`);
      continue;
    }
    const size = sizeById.get(variant.sizeId) ?? null;
    if (!size) {
      skipped.push(`talla "${sizeNameById.get(variant.sizeId) ?? variant.sizeId}" sin equivalente`);
      continue;
    }

    const existing = color.variants.find((v) => v.size === size);
    if (existing) {
      const anyPlenty =
        (existing.posAvailable && !existing.posLowStock) || (variant.available && !variant.lowStock);
      existing.posAvailable = existing.posAvailable || variant.available;
      existing.posLowStock = existing.posAvailable && !anyPlenty;
      existing.stock = stockForAvailability(existing.posAvailable, existing.posLowStock);
      continue;
    }

    color.variants.push({
      size,
      sku: buildPosVariantSku(normalizePosSlug(pos.slug), variant.colorId, variant.sizeId),
      posAvailable: variant.available,
      posLowStock: variant.available && variant.lowStock,
      stock: stockForAvailability(variant.available, variant.lowStock),
    });
  }

  const cover =
    pos.coverImageUrl ??
    colors.flatMap((c) => c.images).find((img) => img.isCover)?.url ??
    colors[0]?.images[0]?.url ??
    null;

  const videoFromMedia = pos.colors.flatMap((c) => c.media).find((m) => m.video)?.url ?? null;

  return {
    posSlug: normalizePosSlug(pos.slug),
    name: pos.name.trim(),
    description: (pos.description ?? "").trim(),
    basePrice: pos.salePrice,
    comparePrice: resolveComparePrice(pos.salePrice, pos.displayPrice),
    videoUrl: pos.videoUrl ?? videoFromMedia,
    coverImageUrl: cover,
    categoryWebIds: uniqueStrings([
      pos.categoryWebId,
      pos.subcategoryWebId,
      ...pos.classifications.flatMap((c) => [c.categoryWebId, c.subcategoryWebId]),
    ]),
    garmentTypeSlugs: uniqueStrings(pos.classifications.map((c) => c.garmentTypeSlug?.toLowerCase())),
    labels: mapPosLabels(pos.labels),
    colors,
    skipped,
  };
}

// ── Pedidos hacia el POS ─────────────────────────────────────────────────────

/** Color y talla del POS guardados en el SKU de la variante: `pos-<slug>-<colorId>-<sizeId>`. */
export function parsePosVariantSku(sku: string): { colorId: number; sizeId: number } | null {
  const match = /^pos-.+-(\d+)-(\d+)$/.exec(sku);
  if (!match) return null;
  return { colorId: Number(match[1]), sizeId: Number(match[2]) };
}

export interface PosLineRef {
  slug: string;
  colorId: number;
  sizeId: number;
}

/**
 * Prenda del POS identificada por su SKU (`pos-<slug>-<colorId>-<sizeId>`), el formato con el que el
 * carrito y los pedidos identifican los ítems del POS sin depender de la copia en Neon. `null` si es
 * un id de Neon (cuid de producto web o conjunto): esos siguen el camino de siempre.
 */
export function parsePosLineId(id: string): PosLineRef | null {
  const match = /^pos-(.+)-(\d+)-(\d+)$/.exec(id);
  if (!match) return null;
  return { slug: normalizePosSlug(match[1]), colorId: Number(match[2]), sizeId: Number(match[3]) };
}

export interface PaidOrderForPos {
  orderNumber: string;
  /** Destinatario del paquete. */
  shippingName: string;
  /** Quien compra (titular de la cuenta); sin él, el cliente del POS es el destinatario. */
  buyerName?: string | null;
  /** Tarifa de envío cobrada (foto del checkout). */
  shippingRateName?: string | null;
  shippingCedula: string | null;
  shippingPhone: string | null;
  shippingCity: string | null;
  shippingDepartment?: string | null;
  shippingAddress: string | null;
  email: string | null;
  shippingCost: number;
  discount: number;
  /** Total cobrado del pedido completo. */
  total?: number | null;
  couponCode?: string | null;
  /** Cupón aplicado (foto de la orden): para el bloque `promotion`. */
  coupon?: {
    code: string;
    /** promotionId del POS; null solo en pedidos viejos con cupones creados en la web. */
    posPromotionId: string | null;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
  } | null;
  payment?: {
    method: string | null;
    paymentId: string | null;
    transactionId: string | null;
    paidAt: Date | string | null;
  } | null;
  items: {
    productId: string;
    sku: string;
    price: number;
    quantity: number;
    name?: string | null;
    colorName?: string | null;
    size?: string | null;
    /** Parte del descuento del cupón en esta línea, calculada por el POS al crear la orden. */
    couponDiscount?: number;
  }[];
}

/** Redondea a pesos: el POS guarda centavos pero la tienda cobra en pesos enteros. */
function pesos(value: number): number {
  return Math.round(value);
}

/**
 * Arma el pedido para el POS con los ítems que vienen del POS (los demás se venden solo en la web).
 * En un pedido mixto el envío se reparte según la parte del subtotal que corresponde a los productos del
 * POS; el descuento del cupón es la suma de lo que el POS calculó para sus líneas (pedidos viejos sin ese
 * reparto: por subtotal). Así la venta del POS cuadra con lo que se cobró por ellos.
 * Devuelve null si el pedido no tiene ningún ítem del POS.
 */
export function buildPosOrderPayload(
  order: PaidOrderForPos,
  posSlugByProductId: Map<string, string>,
): PosOrderPayload | null {
  const lines: PosOrderPayload["lines"] = [];
  let posSubtotal = 0;
  let allSubtotal = 0;
  // Reparto del descuento por línea que hizo el POS al validar el cupón.
  const byLine = order.items.some((item) => (item.couponDiscount ?? 0) > 0);
  let posLineDiscount = 0;
  for (const item of order.items) {
    allSubtotal += item.price * item.quantity;
    const slug = posSlugByProductId.get(item.productId);
    const combo = parsePosVariantSku(item.sku);
    if (!slug || !combo) continue;
    posSubtotal += item.price * item.quantity;
    posLineDiscount += item.couponDiscount ?? 0;
    lines.push({
      productSlug: normalizePosSlug(slug),
      colorId: combo.colorId,
      sizeId: combo.sizeId,
      quantity: item.quantity,
      unitPrice: item.price,
      name: item.name ?? null,
      colorName: item.colorName ?? null,
      size: item.size ?? null,
      sku: item.sku,
    });
  }
  if (lines.length === 0) return null;

  const share = allSubtotal > 0 ? Math.min(1, posSubtotal / allSubtotal) : 1;
  const posDiscount = byLine ? pesos(Math.min(posLineDiscount, order.discount)) : pesos(order.discount * share);
  const paidAt = order.payment?.paidAt;
  return {
    orderNumber: order.orderNumber,
    customer: {
      fullName: order.buyerName?.trim() || order.shippingName,
      documentNumber: order.shippingCedula,
      email: order.email,
      phone: order.shippingPhone,
      city: order.shippingCity,
      address: order.shippingAddress,
      department: order.shippingDepartment ?? null,
    },
    shipping: pesos(order.shippingCost * share),
    discount: posDiscount,
    lines,
    payment: order.payment
      ? {
          method: order.payment.method,
          paymentId: order.payment.paymentId,
          transactionId: order.payment.transactionId,
          paidAt: paidAt ? new Date(paidAt).toISOString() : null,
        }
      : null,
    orderTotal: order.total ?? null,
    couponCode: order.couponCode ?? null,
    shippingName: order.shippingName,
    shippingRateName: order.shippingRateName ?? null,
    promotion: order.coupon
      ? {
          promotionId: order.coupon.posPromotionId,
          code: order.coupon.code,
          source: order.coupon.posPromotionId ? "POS" : "WEB",
          discountType: order.coupon.discountType,
          discountValue: order.coupon.discountValue,
          orderDiscount: pesos(order.discount),
          posDiscount,
        }
      : null,
  };
}
