/** @jest-environment node */
import { posCategorySchema } from "../contracts/pos-catalog.schema";
import { toPosCarouselItems, toPosNavCategories } from "../domain/pos-category-view";

const tree = posCategorySchema.array().parse([
  {
    webId: "cat-b",
    slug: "prendas-superiores",
    name: "Prendas superiores",
    imageUrl: "https://media.casaverdeoficial.com/sup.jpg",
    sortOrder: 2,
    subcategories: [
      { webId: "sub-2", parentWebId: "cat-b", slug: "camisas", name: "Camisas", sortOrder: 2 },
      { webId: "sub-1", parentWebId: "cat-b", slug: "blusas", name: "Blusas", sortOrder: 1, imageUrl: "http://localhost:8080/x.jpg" },
    ],
  },
  { webId: "cat-a", slug: "vestidos", name: "Vestidos", sortOrder: 1 },
]);

describe("toPosCarouselItems", () => {
  it("muestra solo categorías principales ordenadas por sortOrder, sin subcategorías", () => {
    expect(toPosCarouselItems(tree).map((c) => c.slug)).toEqual(["vestidos", "prendas-superiores"]);
  });

  it("usa ids con prefijo pos- para no chocar con las categorías de la web", () => {
    expect(toPosCarouselItems(tree).map((c) => c.id)).toEqual(["pos-cat-a", "pos-cat-b"]);
  });

  it("deja image en null si no hay imagen o el dominio no está permitido", () => {
    const [vestidos, superiores] = toPosCarouselItems(tree);
    expect(vestidos.image).toBeNull();
    expect(superiores.image).toBe("https://media.casaverdeoficial.com/sup.jpg");
    expect(vestidos.isActive).toBe(true);
    const [blocked] = toPosCarouselItems([{ ...tree[1], imageUrl: "http://localhost:8080/x.jpg" }]);
    expect(blocked.image).toBeNull();
  });
});

describe("toPosNavCategories", () => {
  it("devuelve solo categorías principales con sus subcategorías ordenadas", () => {
    const nav = toPosNavCategories(tree);
    expect(nav.map((c) => c.slug)).toEqual(["vestidos", "prendas-superiores"]);
    expect(nav[1]).toEqual({
      id: "pos-cat-b",
      name: "Prendas superiores",
      slug: "prendas-superiores",
      source: "pos",
      subcategories: [
        { id: "pos-sub-1", name: "Blusas", slug: "blusas" },
        { id: "pos-sub-2", name: "Camisas", slug: "camisas" },
      ],
      products: [],
      garmentTypes: [],
    });
  });
});
