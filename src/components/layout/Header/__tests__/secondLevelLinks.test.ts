import { getSecondLevelLinks } from "../utils/secondLevelLinks";
import type { NavCategory } from "../types";

const category: NavCategory = {
  id: "c1",
  name: "Mujer",
  slug: "mujer",
  source: "pos",
  subcategories: [
    { id: "s1", name: "Blusas", slug: "blusas" },
    { id: "s2", name: "Vestidos", slug: "vestidos" },
  ],
  products: [],
};

describe("getSecondLevelLinks", () => {
  it("enlaza cada subcategoría a su colección y marca la activa", () => {
    expect(getSecondLevelLinks(category, "/collections/blusas")).toEqual([
      { id: "s1", name: "Blusas", href: "/collections/blusas", active: true },
      { id: "s2", name: "Vestidos", href: "/collections/vestidos", active: false },
    ]);
  });

  it("una categoría sin subcategorías no tiene segundo nivel", () => {
    expect(getSecondLevelLinks({ ...category, subcategories: [] }, "/collections/mujer")).toEqual([]);
  });
});
