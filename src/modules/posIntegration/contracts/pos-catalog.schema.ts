import { z } from "zod";

// Espejo de `PublicCatalogDtos.java` del POS (lista blanca de campos).

const nullableString = z.string().nullish().transform((v) => v ?? null);
const decimal = z.union([z.number(), z.string()]).transform((v) => Number(v));

/** Tipo de prenda global del POS (filtro ?tipo=): lo comparten subcategorías de distintas categorías. */
export const posGarmentTypeSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

export const posSubcategorySchema = z.object({
  webId: z.string().min(1),
  parentWebId: nullableString,
  slug: z.string().min(1),
  name: z.string().min(1),
  description: nullableString,
  imageUrl: nullableString,
  metaTitle: nullableString,
  metaDescription: nullableString,
  sortOrder: z.number().int().default(0),
  updatedAt: nullableString,
  garmentType: posGarmentTypeSchema.nullish().transform((v) => v ?? null),
});

export const posCategorySchema = posSubcategorySchema.omit({ parentWebId: true, garmentType: true }).extend({
  subcategories: z.array(posSubcategorySchema).default([]),
});

/** Ubicación del producto en la tienda: la principal del POS y las «Mostrar también en». */
export const posClassificationSchema = z.object({
  categoryWebId: nullableString,
  subcategoryWebId: nullableString,
  garmentTypeSlug: nullableString,
  primary: z.boolean().default(false),
});

/** Etiqueta de vitrina del POS: BEST_SELLER | PRODUCT_NEW | SUGGEST_POPUP | ON_SALE (en oferta). */
export const posLabelSchema = z.object({
  code: z.string().min(1),
  assignedAt: nullableString,
});

export const posMediaSchema = z.object({
  url: z.string().min(1),
  video: z.boolean().default(false),
  cover: z.boolean().default(false),
  /** Texto alternativo de la foto (V106); el POS publica «<producto> - <color>» si no se cargó. */
  alt: nullableString,
});

/** Color del catálogo del POS (`GET /colors`): la paleta de la web. `totalProducts` = productos publicados. */
export const posColorFacetSchema = z.object({
  colorId: z.number().int(),
  name: z.string().min(1),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  totalProducts: z.number().int().nonnegative().default(0),
});

export const posColorSchema = z.object({
  colorId: z.number().int().nullable(),
  name: z.string().min(1),
  hexCode: nullableString,
  media: z.array(posMediaSchema).default([]),
});

export const posSizeSchema = z.object({
  sizeId: z.number().int().nullable(),
  name: z.string().min(1),
});

export const posVariantSchema = z.object({
  colorId: z.number().int().nullable(),
  sizeId: z.number().int().nullable(),
  available: z.boolean(),
  lowStock: z.boolean(),
});

export const posProductSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: nullableString,
  salePrice: decimal,
  displayPrice: decimal.nullish().transform((v) => v ?? null),
  coverImageUrl: nullableString,
  videoUrl: nullableString,
  categoryWebId: nullableString,
  subcategoryWebId: nullableString,
  classifications: z.array(posClassificationSchema).default([]),
  available: z.boolean(),
  colors: z.array(posColorSchema).default([]),
  sizes: z.array(posSizeSchema).default([]),
  variants: z.array(posVariantSchema).default([]),
  labels: z.array(posLabelSchema).default([]),
  updatedAt: nullableString,
});

export const posEnvelopeSchema = z.object({
  success: z.boolean().optional(),
  data: z.unknown(),
});

export function posPageSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    total: z.number(),
    page: z.number().int(),
    size: z.number().int(),
  });
}

export const posWebhookPayloadSchema = z.object({
  eventId: z.string().min(1),
  event: z.string().min(1),
  // shipping: cambió la geografía o el precio de envíos (id = "shipping"); se vuelve a sincronizar todo.
  // admin: cambiaron los administradores de la web en el POS (id = "admin"); se vuelve a sincronizar la lista.
  // color: se creó, cambió o desactivó un color del catálogo (id = colorId); se vuelve a leer GET /colors.
  entityType: z.enum(["category", "subcategory", "product", "color", "promotion", "order", "shipping", "admin"]),
  id: z.string().min(1),
  // status_changed: el POS cambió el estado logístico de un pedido (id = número del pedido).
  action: z.enum(["upserted", "removed", "stock_changed", "status_changed"]),
  occurredAt: z.string().optional(),
});

/** Estado logístico de un pedido en el POS (Tienda → Pedidos). */
export const POS_FULFILLMENT_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const;
export type PosFulfillmentStatus = (typeof POS_FULFILLMENT_STATUSES)[number];

/** Respuesta de GET y POST /api/public/orders/{orderNumber}[/status]. */
export const posOrderStatusSchema = z.object({
  orderNumber: z.string(),
  status: z.string(),
  saleNumber: z.string().nullish(),
  saleStatus: z.string().nullish(),
  fulfillmentStatus: z.enum(POS_FULFILLMENT_STATUSES).nullish().transform((v) => v ?? null),
  trackingNumber: nullableString,
  trackingUrl: nullableString,
  shippedAt: nullableString,
  deliveredAt: nullableString,
  updatedAt: nullableString,
});
export type PosOrderStatus = z.infer<typeof posOrderStatusSchema>;

/** Cambio de estado hecho en la web que se reporta al POS (POST /orders/{orderNumber}/status). */
export type PosOrderStatusUpdate = {
  status: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  confirmedByCustomer?: boolean;
  note?: string | null;
  changedAt?: string | null;
};

/** Respuesta de POST /api/public/orders. */
export const posOrderResultSchema = z.object({
  saleNumber: z.string().nullish(),
  total: decimal.nullish(),
  replay: z.boolean().default(false),
});

export type PosSubcategory = z.infer<typeof posSubcategorySchema>;
export type PosOrderResult = z.infer<typeof posOrderResultSchema>;

export type PosOrderLine = {
  productSlug: string;
  colorId: number;
  sizeId: number;
  quantity: number;
  unitPrice: number;
  name?: string | null;
  colorName?: string | null;
  size?: string | null;
  sku?: string | null;
};

/**
 * Pedido pagado que la web reporta al POS para que lo registre como venta. `shipping` y `discount`
 * son los que corresponden a los productos del POS (prorrateados en pedidos mixtos); `orderTotal`
 * es lo cobrado por el pedido completo.
 */
export type PosOrderPayload = {
  orderNumber: string;
  customer: {
    fullName: string;
    documentNumber: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    address: string | null;
    department?: string | null;
  } | null;
  shipping: number;
  discount: number;
  lines: PosOrderLine[];
  payment?: {
    method: string | null;
    paymentId: string | null;
    transactionId: string | null;
    paidAt: string | null;
  } | null;
  orderTotal?: number | null;
  couponCode?: string | null;
  /** Cupón aplicado: con promotionId el POS registra el uso del canal WEB en esa promoción. */
  promotion?: PosOrderPromotion | null;
};

export type PosOrderPromotion = {
  /** promotionId del POS; null solo en pedidos viejos con cupones creados en la web. */
  promotionId: string | null;
  code: string;
  source: "POS" | "WEB";
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  /** Descuento total del pedido web. */
  orderDiscount: number;
  /** Parte del descuento que corresponde a los productos del POS (= discount de la raíz). */
  posDiscount: number;
};

/** Resultado de POST /api/public/orders/check: qué no alcanza antes de cobrar. */
export const posStockCheckSchema = z.object({
  available: z.boolean(),
  problems: z
    .array(
      z.object({
        productSlug: z.string(),
        colorId: z.number().int(),
        sizeId: z.number().int(),
        requested: z.number().int(),
        available: z.number().int(),
        message: z.string().nullish(),
      }),
    )
    .default([]),
});

export type PosStockCheck = z.infer<typeof posStockCheckSchema>;

/** Resultado de POST /api/public/orders/{orderNumber}/cancel. */
export const posOrderCancelResultSchema = z.object({
  status: z.string(),
  saleNumber: z.string().nullish(),
  replay: z.boolean().default(false),
});
export type PosCategory = z.infer<typeof posCategorySchema>;
export type PosProduct = z.infer<typeof posProductSchema>;
export type PosColor = z.infer<typeof posColorSchema>;
export type PosColorFacet = z.infer<typeof posColorFacetSchema>;
export type PosVariant = z.infer<typeof posVariantSchema>;
export type PosWebhookPayload = z.infer<typeof posWebhookPayloadSchema>;

export type PosProductQuery = {
  categoryWebId?: string;
  subcategoryWebId?: string;
  updatedSince?: string;
  page?: number;
  size?: number;
};

// ── Cupones del POS en el checkout (md/COMPARACION-TABLAS-PROMOCIONES-POS-vs-WEB.md, §4) ─────────────
// La web no guarda cupones: valida cada código contra el POS y le pide los cupones de bienvenida.

/** Línea del carrito para POST /api/public/promotions/validate. `productSlug` nulo: producto solo de la web. */
export type PosPromotionValidateLine = {
  index: number;
  productSlug: string | null;
  colorId?: number | null;
  sizeId?: number | null;
  quantity: number;
  unitPrice: number;
};

export type PosPromotionValidateRequest = {
  code: string;
  customerEmail?: string | null;
  customerDocument?: string | null;
  subtotal?: number | null;
  lines: PosPromotionValidateLine[];
};

/**
 * Respuesta de POST /api/public/promotions/validate (`WebQuoteResult` del POS). Con `valid = false` solo
 * vienen `code`, `reason` y `message` (texto para el cliente).
 */
export const posPromotionValidationSchema = z.object({
  valid: z.boolean(),
  promotionId: nullableString,
  code: nullableString,
  kind: z.enum(["PROMOTIONAL", "BATCH", "EMAIL"]).nullish().transform((v) => v ?? null),
  name: nullableString,
  discountType: z.enum(["PERCENTAGE", "FIXED"]).nullish().transform((v) => v ?? null),
  discountValue: z.number().int().nullish().transform((v) => v ?? null),
  minPurchase: decimal.nullish().transform((v) => v ?? null),
  scopeType: z.enum(["ORDER", "PRODUCTS", "CATEGORIES"]).nullish().transform((v) => v ?? null),
  eligibleBase: decimal.default(0),
  discountAmount: decimal.default(0),
  lineDiscounts: z
    .array(z.object({ index: z.number().int(), productSlug: nullableString, discount: decimal }))
    .nullish()
    .transform((v) => v ?? []),
  reason: nullableString,
  message: nullableString,
});

export type PosPromotionValidation = z.infer<typeof posPromotionValidationSchema>;

/** Cupón de bienvenida emitido por el POS (POST /api/public/promotions/{promotionId}/codes). */
export const posIssuedCodeSchema = z.object({
  promotionId: z.string().min(1),
  code: z.string().min(1),
  assignedEmail: z.string().min(1),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().int(),
  expiresAt: nullableString,
  used: z.boolean().default(false),
  reused: z.boolean().default(false),
});

export type PosIssuedCode = z.infer<typeof posIssuedCodeSchema>;
