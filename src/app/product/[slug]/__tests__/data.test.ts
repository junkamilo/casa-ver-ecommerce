import { allVariants, ALL_SIZES } from "../data";

describe("allVariants", () => {
  it("tiene 4 variantes de producto", () => {
    expect(allVariants).toHaveLength(4);
  });

  it("cada variante tiene nombre, precio y colores", () => {
    allVariants.forEach((v) => {
      expect(v.name).toBeTruthy();
      expect(v.price).toBeGreaterThan(0);
      expect(v.colors.length).toBeGreaterThan(0);
    });
  });

  it("cada variante tiene al menos una imagen en la galería", () => {
    allVariants.forEach((v) => {
      expect(v.gallery.length).toBeGreaterThan(0);
    });
  });

  it("los tipos de variante son únicos", () => {
    const types = allVariants.map((v) => v.type);
    const uniqueTypes = new Set(types);
    expect(uniqueTypes.size).toBe(allVariants.length);
  });
});

describe("ALL_SIZES", () => {
  it("contiene 7 tallas", () => {
    expect(ALL_SIZES).toHaveLength(7);
  });

  it("incluye tallas estándar", () => {
    expect(ALL_SIZES).toContain("XS");
    expect(ALL_SIZES).toContain("S");
    expect(ALL_SIZES).toContain("M");
    expect(ALL_SIZES).toContain("L");
    expect(ALL_SIZES).toContain("XL");
  });
});
