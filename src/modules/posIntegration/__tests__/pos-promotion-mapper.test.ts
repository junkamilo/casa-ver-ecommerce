/** @jest-environment node */
import { posPromotionSchema, posWebhookPayloadSchema } from "../contracts/pos-catalog.schema";
import { mapPosLabels } from "../domain/pos-mapper";
import { batchCouponKey, mapPosPromotion, posPromotionIdOf } from "../domain/pos-promotion-mapper";

function promotion(overrides: Record<string, unknown> = {}) {
  return posPromotionSchema.parse({
    promotionId: "PRM-2026-0042",
    code: "blackfriday25",
    name: "Black Friday 25% web",
    discountType: "PERCENTAGE",
    discountValue: 25,
    minPurchase: null,
    maxUses: 500,
    maxUsesPerCustomer: 1,
    startsAt: "2026-11-27T05:00:00Z",
    endsAt: "2026-12-01T04:59:59.999Z",
    active: true,
    channels: ["WEB", "STORE"],
    scope: { type: "ORDER", productSlugs: null, categoryWebIds: null },
    updatedAt: "2026-10-15T14:32:10Z",
    ...overrides,
  });
}

describe("contrato de promociones del POS", () => {
  it("pasa el código a mayúsculas y rechaza valores fuera de rango", () => {
    expect(promotion().code).toBe("BLACKFRIDAY25");
    expect(() => promotion({ code: "a b" })).toThrow();
    expect(() => promotion({ discountValue: 120 })).toThrow();
    expect(() => promotion({ discountType: "FIXED", discountValue: 6_000_000 })).toThrow();
  });

  it("acepta avisos de promociones", () => {
    expect(
      posWebhookPayloadSchema.parse({
        eventId: "e-1", event: "promotion.upserted", entityType: "promotion", id: "PRM-2026-0042", action: "upserted",
      }).entityType,
    ).toBe("promotion");
  });
});

describe("mapPosPromotion (B.7)", () => {
  it("rango de fechas → DATE_RANGE y cupón PROMOTIONAL de 1 uso por persona", () => {
    const mapped = mapPosPromotion(promotion());
    expect(mapped).toEqual(
      expect.objectContaining({
        posPromotionId: "PRM-2026-0042",
        code: "BLACKFRIDAY25",
        label: "Black Friday 25% web",
        discountPercentage: 25,
        maxGlobalUses: 500,
        maxUsesPerUser: 1,
        scheduleMode: "DATE_RANGE",
        isActive: true,
        scopeType: "ORDER",
        forWeb: true,
      }),
    );
    expect(mapped.validFrom?.toISOString()).toBe("2026-11-27T05:00:00.000Z");
  });

  it("mismo día en Bogotá → SINGLE_DAY; sin fechas → NONE", () => {
    expect(
      mapPosPromotion(promotion({ startsAt: "2026-11-28T13:00:00Z", endsAt: "2026-11-29T03:00:00Z" })).scheduleMode,
    ).toBe("SINGLE_DAY");
    const none = mapPosPromotion(promotion({ startsAt: null, endsAt: null }));
    expect(none.scheduleMode).toBe("NONE");
    expect(none.validFrom).toBeNull();
  });

  it("sin canal WEB no se activa en la web", () => {
    const mapped = mapPosPromotion(promotion({ channels: ["STORE"] }));
    expect(mapped.forWeb).toBe(false);
    expect(mapped.isActive).toBe(false);
  });

  it("valor fijo, compra mínima y alcance por productos", () => {
    const mapped = mapPosPromotion(
      promotion({
        discountType: "FIXED",
        discountValue: 20000,
        minPurchase: 100000,
        scope: { type: "PRODUCTS", productSlugs: ["Vestido-Lino"], categoryWebIds: null },
      }),
    );
    expect(mapped.discountPercentage).toBe(0);
    expect(mapped.minPurchase).toBe(100000);
    expect(mapped.scopeType).toBe("PRODUCTS");
    expect(mapped.scopeProductSlugs).toEqual(["vestido-lino"]);
  });
});

describe("lotes de cupones del POS (BATCH)", () => {
  const batch = () =>
    promotion({
      promotionId: "PRM-2026-0003",
      kind: "BATCH",
      code: null,
      codes: [
        { code: "k7m2q9x4b1c8", used: true },
        { code: "P3V8N6T1R5W2", used: false },
      ],
      name: "Clientes frecuentes",
      discountValue: 10,
      maxUses: 2,
      startsAt: null,
      endsAt: null,
    });

  it("cada código es un cupón de un solo uso con su estado", () => {
    const mapped = mapPosPromotion(batch());
    expect(mapped.kind).toBe("BATCH");
    expect(mapped.batchCodes).toEqual([
      { code: "K7M2Q9X4B1C8", used: true },
      { code: "P3V8N6T1R5W2", used: false },
    ]);
    expect(mapped.maxGlobalUses).toBe(1);
    expect(mapped.discountPercentage).toBe(10);
  });

  it("el código promocional exige código y el lote solo admite porcentaje", () => {
    expect(() => promotion({ code: null })).toThrow();
    expect(() => promotion({ kind: "BATCH", code: null, discountType: "FIXED", discountValue: 1000 })).toThrow();
    expect(promotion().kind).toBe("PROMOTIONAL");
  });

  it("la llave del cupón de lote guarda el promotionId y el código", () => {
    const key = batchCouponKey("PRM-2026-0003", "P3V8N6T1R5W2");
    expect(key).toBe("PRM-2026-0003:P3V8N6T1R5W2");
    expect(posPromotionIdOf(key)).toBe("PRM-2026-0003");
    expect(posPromotionIdOf("PRM-2026-0042")).toBe("PRM-2026-0042");
    expect(posPromotionIdOf(null)).toBeNull();
  });
});

describe("etiqueta ON_SALE", () => {
  it("se traduce a isOnSale con su fecha", () => {
    const labels = mapPosLabels([{ code: "ON_SALE", assignedAt: "2026-11-27T05:00:00Z" }]);
    expect(labels.isOnSale).toBe(true);
    expect(labels.isOnSaleAt?.toISOString()).toBe("2026-11-27T05:00:00.000Z");
    expect(mapPosLabels([]).isOnSale).toBe(false);
  });
});
