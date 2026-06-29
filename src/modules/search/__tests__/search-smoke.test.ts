/** @jest-environment node */

import {
  expandSpanishTokenVariants,
  matchesSearchQuery,
  normalizeSearchText,
  productMatchesSearch,
  scoreSearchRelevance,
  tokenizeSearchQuery,
  tokenMatchesText,
} from "@/modules/search/domain/search.entity";
import { buildSearchableText } from "@/modules/search/infrastructure/prisma-search.repository";

describe("search entity", () => {
  it("normalizeSearchText quita tildes, trim y colapsa espacios", () => {
    expect(normalizeSearchText("Camión")).toBe("camion");
    expect(normalizeSearchText("  Vestido Seda  ")).toBe("vestido seda");
    expect(normalizeSearchText("Pantalón   Visión")).toBe("pantalon vision");
  });

  it("matchesSearchQuery encuentra coincidencias sin importar tildes", () => {
    expect(matchesSearchQuery("Camión de juguete", "camion")).toBe(true);
    expect(matchesSearchQuery("Camion", "camión")).toBe(true);
    expect(matchesSearchQuery("Vestido Seda", "seda")).toBe(true);
    expect(matchesSearchQuery("Vestido Seda", "pantalon")).toBe(false);
  });

  it("expandSpanishTokenVariants genera plural y singular", () => {
    expect(expandSpanishTokenVariants("pantalones")).toContain("pantalon");
    expect(expandSpanishTokenVariants("pantalon")).toContain("pantalones");
  });

  it("tokenMatchesText resuelve plural y tildes", () => {
    const haystack = normalizeSearchText("Pantalón Visión");
    expect(tokenMatchesText(haystack, "pantalon")).toBe(true);
    expect(tokenMatchesText(haystack, "pantalones")).toBe(true);
    expect(tokenMatchesText(haystack, "vision")).toBe(true);
  });

  it("productMatchesSearch exige todos los tokens en multi-palabra", () => {
    expect(productMatchesSearch("Pantalón Verde Militar", "pantalon verde")).toBe(true);
    expect(productMatchesSearch("Pantalón Verde Militar", "pantalon azul")).toBe(false);
  });

  it("productMatchesSearch resuelve el caso pantalones vs Pantalón Visión", () => {
    expect(productMatchesSearch("Pantalón Visión", "pantalones")).toBe(true);
    expect(productMatchesSearch("Pantalón Visión", "pantalon vision")).toBe(true);
    expect(productMatchesSearch("Pantalón", "pantalones")).toBe(true);
  });

  it("tokenizeSearchQuery descarta tokens de menos de 2 caracteres", () => {
    expect(tokenizeSearchQuery("p")).toEqual([]);
    expect(tokenizeSearchQuery("pantalon p")).toEqual(["pantalon"]);
  });

  it("scoreSearchRelevance prioriza nombre sobre descripción", () => {
    expect(
      scoreSearchRelevance(
        { name: "Pantalón Visión", description: "Tela suave" },
        "pantalon"
      )
    ).toBe(3);

    expect(
      scoreSearchRelevance(
        { name: "Conjunto Premium", description: "Incluye pantalon verde" },
        "pantalon"
      )
    ).toBe(1);
  });
});

describe("buildSearchableText", () => {
  const baseProduct = {
    id: "1",
    name: "Conjunto Verano",
    description: "Set cómodo para el día",
    slug: "conjunto-verano",
    metaTitle: null,
    metaDescription: null,
    isFeatured: false,
    createdAt: new Date(),
    garmentTypes: [{ garmentType: { name: "Pantalón" } }],
    categories: [{ category: { name: "Mujer" } }],
    items: [{ name: "Short" }],
  };

  it("incluye tipos de prenda, categorías e ítems de conjunto", () => {
    const text = buildSearchableText(baseProduct);
    expect(productMatchesSearch(text, "pantalones")).toBe(true);
    expect(productMatchesSearch(text, "short")).toBe(true);
    expect(productMatchesSearch(text, "mujer")).toBe(true);
  });
});
