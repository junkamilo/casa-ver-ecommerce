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
  entityType: z.enum(["category", "subcategory", "product", "promotion", "order", "shipping", "admin"]),
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
  /** Cupón aplicado (B.8): con promotionId el POS suma un uso del canal WEB a esa promoción. */
  promotion?: PosOrderPromotion | null;
};

export type PosOrderPromotion = {
  /** promotionId del POS; null si el cupón se creó en la web. */
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
export type PosVariant = z.infer<typeof posVariantSchema>;
export type PosWebhookPayload = z.infer<typeof posWebhookPayloadSchema>;

export type PosProductQuery = {
  categoryWebId?: string;
  subcategoryWebId?: string;
  updatedSince?: string;
  page?: number;
  size?: number;
};

// ── Promociones del POS (docs/promociones-web-y-pos.md, B.5) ─────────────────

export const POS_PROMOTION_CODE = /^[A-Z0-9-]{4,20}$/;

export const posPromotionScopeSchema = z.object({
  type: z.enum(["ORDER", "PRODUCTS", "CATEGORIES"]).default("ORDER"),
  productSlugs: z.array(z.string()).nullish().transform((v) => v ?? []),
  categoryWebIds: z.array(z.string()).nullish().transform((v) => v ?? []),
});

/** Espejo de `PublicPromotion` del POS (contrato-pos-promocion.json). */
const posPromotionCodeSchema = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .pipe(z.string().regex(POS_PROMOTION_CODE, "Código inválido"));

/** Código de un lote (BATCH): `used` = ya se usó en la tienda o en la web. */
export const posPromotionBatchCodeSchema = z.object({
  code: posPromotionCodeSchema,
  used: z.boolean().default(false),
});

export const posPromotionSchema = z
  .object({
    promotionId: z.string().min(1),
    /** PROMOTIONAL: un código compartido. BATCH: lote de códigos de un solo uso (como BATCH_SINGLE). */
    kind: z.enum(["PROMOTIONAL", "BATCH"]).default("PROMOTIONAL"),
    code: posPromotionCodeSchema.nullish().transform((v) => v ?? null),
    codes: z.array(posPromotionBatchCodeSchema).nullish().transform((v) => v ?? []),
    name: nullableString,
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().int().positive(),
    minPurchase: z.number().int().nonnegative().nullish().transform((v) => v ?? null),
    maxUses: z.number().int().min(1).max(10000),
    maxUsesPerCustomer: z.number().int().default(1),
    startsAt: nullableString,
    endsAt: nullableString,
    active: z.boolean(),
    channels: z.array(z.enum(["WEB", "STORE"])).default(["WEB"]),
    scope: posPromotionScopeSchema
      .nullish()
      .transform((v) => v ?? { type: "ORDER" as const, productSlugs: [], categoryWebIds: [] }),
    updatedAt: nullableString,
  })
  .superRefine((p, ctx) => {
    if (p.kind === "PROMOTIONAL" && !p.code) {
      ctx.addIssue({ code: "custom", message: "Falta el código", path: ["code"] });
    }
    if (p.kind === "BATCH" && p.discountType !== "PERCENTAGE") {
      ctx.addIssue({ code: "custom", message: "Los lotes solo son por porcentaje", path: ["discountType"] });
    }
    if (p.discountType === "PERCENTAGE" && p.discountValue > 100) {
      ctx.addIssue({ code: "custom", message: "Porcentaje > 100", path: ["discountValue"] });
    }
    if (p.discountType === "FIXED" && p.discountValue > 5_000_000) {
      ctx.addIssue({ code: "custom", message: "Fijo > 5.000.000", path: ["discountValue"] });
    }
  });

export type PosPromotion = z.infer<typeof posPromotionSchema>;

export type PosPromotionQuery = {
  updatedSince?: string;
  channel?: "WEB" | "STORE";
  page?: number;
  size?: number;
};
