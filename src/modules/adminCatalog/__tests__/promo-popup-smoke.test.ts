/** @jest-environment node */

import {
  createPromoPopupSchema,
  activePromoPopupQuerySchema,
} from "@/modules/adminCatalog/promoPopups/contracts/promo-popup.schema";
import { isPromoPopupInSchedule } from "@/modules/adminCatalog/promoPopups/domain/promo-popup.entity";

describe("Promo popup — schema", () => {
  const validBase = {
    name: "Primera compra Home",
    placement: "HOME" as const,
    headline: "10% OFF",
    subtitle: "en tu primera compra",
    couponCode: "MIPRIMERACOMPRA",
    disclaimer: "Descuento exclusivo por tiempo limitado.",
    ctaText: "COMPRAR AHORA",
    ctaUrl: "/tienda",
    delaySeconds: 3,
    scheduleEnabled: false,
  };

  it("acepta payload mínimo válido", () => {
    const r = createPromoPopupSchema.safeParse(validBase);
    expect(r.success).toBe(true);
  });

  it("rechaza headline vacío", () => {
    const r = createPromoPopupSchema.safeParse({ ...validBase, headline: "" });
    expect(r.success).toBe(false);
  });

  it("normaliza couponCode a mayúsculas", () => {
    const r = createPromoPopupSchema.safeParse({ ...validBase, couponCode: "verde20" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.couponCode).toBe("VERDE20");
  });

  it("activePromoPopupQuerySchema valida placement", () => {
    expect(activePromoPopupQuerySchema.safeParse({ placement: "PRODUCT" }).success).toBe(true);
    expect(activePromoPopupQuerySchema.safeParse({ placement: "INVALID" }).success).toBe(false);
  });
});

describe("Promo popup — schedule", () => {
  it("sin vigencia siempre está en horario", () => {
    expect(
      isPromoPopupInSchedule({ scheduleMode: "NONE", validFrom: null, validTo: null })
    ).toBe(true);
  });

  it("fuera de rango retorna false", () => {
    const pastFrom = new Date("2020-01-01T12:00:00-05:00");
    const pastTo = new Date("2020-01-01T18:00:00-05:00");
    expect(
      isPromoPopupInSchedule(
        { scheduleMode: "SINGLE_DAY", validFrom: pastFrom, validTo: pastTo },
        new Date("2026-06-17T12:00:00-05:00")
      )
    ).toBe(false);
  });
});
