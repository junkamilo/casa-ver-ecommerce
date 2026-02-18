import { formatPrice, getStockStatus, SIZES, newColorForm } from "../constants";

describe("formatPrice", () => {
  it("formatea precio en pesos colombianos", () => {
    expect(formatPrice(89900)).toContain("89.900");
  });

  it("formatea precio cero", () => {
    expect(formatPrice(0)).toContain("0");
  });
});

describe("getStockStatus", () => {
  it("retorna Agotado cuando stock es 0", () => {
    expect(getStockStatus(0).label).toBe("Agotado");
  });

  it("retorna Bajo Stock cuando stock es menor a 5", () => {
    expect(getStockStatus(3).label).toBe("Bajo Stock");
  });

  it("retorna En Stock cuando stock es 5 o más", () => {
    expect(getStockStatus(10).label).toBe("En Stock");
  });

  it("aplica clases de color rojas para Agotado", () => {
    expect(getStockStatus(0).color).toContain("red");
  });

  it("aplica clases de color ámbar para Bajo Stock", () => {
    expect(getStockStatus(2).color).toContain("amber");
  });

  it("aplica clases de color verde para En Stock", () => {
    expect(getStockStatus(10).color).toContain("emerald");
  });
});

describe("SIZES", () => {
  it("contiene todas las tallas esperadas", () => {
    expect(SIZES).toContain("XS");
    expect(SIZES).toContain("S");
    expect(SIZES).toContain("M");
    expect(SIZES).toContain("L");
    expect(SIZES).toContain("XL");
    expect(SIZES).toContain("XXL");
    expect(SIZES).toContain("ONESIZE");
  });
});

describe("newColorForm", () => {
  it("genera un formulario de color con id único", () => {
    const a = newColorForm();
    const b = newColorForm();
    expect(a.tempId).not.toBe(b.tempId);
  });

  it("inicializa todas las tallas en el formulario", () => {
    const color = newColorForm();
    SIZES.forEach((size) => {
      expect(color.variants[size]).toBeDefined();
      expect(color.variants[size].stock).toBe("");
    });
  });

  it("inicializa con color negro por defecto", () => {
    expect(newColorForm().hexCode).toBe("#000000");
  });
});
