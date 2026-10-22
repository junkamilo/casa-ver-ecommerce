import { getSecondLevelLinks } from "../utils/secondLevelLinks";
import type { NavCategory } from "../types";

const base: NavCategory = {
  id: "c1",
  name: "Mujer",
  slug: "mujer",
  subcategories: [{ id: "s1", name: "Blusas", slug: "blusas" }],
  products: [],
  garmentTypes: [{ id: "g1", name: "Vestidos", slug: "vestidos" }],
};

describe("getSecondLevelLinks", () => {
  it("usa tipos de prenda para las categorías de la web", () => {
    expect(getSecondLevelLinks(base, "/collections/mujer", "vestidos")).toEqual([
      { id: "g1", name: "Vestidos", href: "/collections/mujer?tipo=vestidos", active: true },
    ]);
  });

  it("usa subcategorías para las categorías del POS", () => {
    expect(getSecondLevelLinks({ ...base, source: "pos" }, "/collections/blusas", null)).toEqual([
      { id: "s1", name: "Blusas", href: "/collections/blusas", active: true },
    ]);
  });
});
