/** @jest-environment node */
import { assertWebColorSellable } from "../domain/web-color-guard";
import { ProductUnavailableError } from "../application/checkout.errors";
import { buildPosColorPalette } from "@/modules/posIntegration/domain/pos-color-palette";

const palette = buildPosColorPalette([{ colorId: 1, name: "Verde Militar", hexCode: "#4B5320", totalProducts: 0 }]);

describe("checkout · colores de productos de la web", () => {
  it("vende un producto de la web solo en colores que existen en el POS", () => {
    expect(() =>
      assertWebColorSellable(palette, { posSlug: null, colorName: "verde militar" }, "Blusa"),
    ).not.toThrow();
    expect(() => assertWebColorSellable(palette, { posSlug: null, colorName: "Rosa" }, "Blusa")).toThrow(
      new ProductUnavailableError('El color "Rosa" de "Blusa" ya no está disponible'),
    );
  });

  it("sin colores en el POS no se vende ningún color de un producto de la web", () => {
    expect(() =>
      assertWebColorSellable(buildPosColorPalette([]), { posSlug: null, colorName: "Verde Militar" }, "Blusa"),
    ).toThrow(ProductUnavailableError);
  });

  it("no revisa la copia de productos del POS ni restringe sin integración", () => {
    expect(() => assertWebColorSellable(palette, { posSlug: "blusa-pos", colorName: "Rosa" }, "Blusa")).not.toThrow();
    expect(() => assertWebColorSellable(null, { posSlug: null, colorName: "Rosa" }, "Blusa")).not.toThrow();
  });
});
