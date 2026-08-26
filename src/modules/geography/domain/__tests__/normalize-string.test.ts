import { normalizeString } from "@/modules/geography/domain/normalize-string";

describe("normalizeString", () => {
  it("quita tildes y baja a minúsculas", () => {
    expect(normalizeString("  Bogotá D.C. ")).toBe("bogota d.c.");
  });

  it("normaliza 'Atlántico' correctamente", () => {
    expect(normalizeString("Atlántico")).toBe("atlantico");
  });

  it("colapsa espacios internos múltiples", () => {
    expect(normalizeString("  San  Andrés   de   Sotavento  ")).toBe(
      "san andres de sotavento",
    );
  });

  it("maneja cadenas sin tildes sin cambios", () => {
    expect(normalizeString("barranquilla")).toBe("barranquilla");
  });

  it("maneja string vacío", () => {
    expect(normalizeString("")).toBe("");
  });

  it("maneja mayúsculas mezcladas", () => {
    expect(normalizeString("BUCARAMANGA")).toBe("bucaramanga");
  });

  it("normaliza caracteres especiales colombianos (ñ se conserva)", () => {
    expect(normalizeString("Señor")).toBe("senor");
  });

  it("preserva puntos y guiones", () => {
    expect(normalizeString("San José del Guaviare")).toBe(
      "san jose del guaviare",
    );
  });
});
