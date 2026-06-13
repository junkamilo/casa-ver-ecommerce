/** @jest-environment node */

import {
  matchesSearchQuery,
  normalizeSearchText,
} from "@/modules/search/domain/search.entity";

describe("search entity", () => {
  it("normalizeSearchText quita tildes y pasa a minúsculas", () => {
    expect(normalizeSearchText("Camión")).toBe("camion");
    expect(normalizeSearchText("  Vestido Seda  ")).toBe("  vestido seda  ");
  });

  it("matchesSearchQuery encuentra coincidencias sin importar tildes", () => {
    expect(matchesSearchQuery("Camión de juguete", "camion")).toBe(true);
    expect(matchesSearchQuery("Camion", "camión")).toBe(true);
    expect(matchesSearchQuery("Vestido Seda", "seda")).toBe(true);
    expect(matchesSearchQuery("Vestido Seda", "pantalon")).toBe(false);
  });
});
