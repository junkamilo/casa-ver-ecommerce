/** @jest-environment node */
import { posCategorySchema } from "../contracts/pos-catalog.schema";
import {
  buildPosTaxonomy,
  collectionSlugsForWebId,
  posCategoryTreeSignature,
  toPosCarouselItems,
  toPosNavCategories,
} from "../domain/pos-category-view";

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

describe("buildPosTaxonomy", () => {
  const withTypes = posCategorySchema.array().parse([
    {
      webId: "cat-a",
      slug: " Conjuntos ",
      name: "Conjuntos",
      description: "Sets",
      metaTitle: "Conjuntos | Casa Verde",
      subcategories: [
        {
          webId: "sub-1",
          parentWebId: "cat-a",
          slug: "conjuntos-mujer",
          name: "Mujer",
          garmentType: { slug: "Pantalon", name: "Pantalón", sortOrder: 1 },
        },
        { webId: "sub-2", parentWebId: "cat-a", slug: "conjuntos-hombre", name: "Hombre" },
      ],
    },
  ]);

  it("indexa categorías y subcategorías por slug (minúsculas) y por webId", () => {
    const taxonomy = buildPosTaxonomy(withTypes);
    expect(taxonomy.bySlug.get("conjuntos")).toEqual(
      expect.objectContaining({ kind: "category", webId: "cat-a", name: "Conjuntos", metaTitle: "Conjuntos | Casa Verde" }),
    );
    expect(taxonomy.bySlug.get("conjuntos-mujer")).toEqual(
      expect.objectContaining({ kind: "subcategory", webId: "sub-1", parentSlug: "conjuntos" }),
    );
    expect(taxonomy.byWebId.get("sub-2")?.slug).toBe("conjuntos-hombre");
  });

  it("toma los tipos de prenda de las subcategorías", () => {
    expect([...buildPosTaxonomy(withTypes).garmentTypes.values()]).toEqual([
      { slug: "pantalon", name: "Pantalón", sortOrder: 1 },
    ]);
  });

  it("sin categorías en el POS queda vacía (la tienda no muestra categorías)", () => {
    const empty = buildPosTaxonomy([]);
    expect(empty.bySlug.size).toBe(0);
    expect(empty.garmentTypes.size).toBe(0);
  });
});

describe("posCategoryTreeSignature", () => {
  it("cambia si el POS renombra una subcategoría y es estable si nada cambia", () => {
    const renamed = posCategorySchema.array().parse(
      tree.map((c) => ({ ...c, subcategories: c.subcategories.map((s) => ({ ...s, name: `${s.name} nuevo` })) })),
    );
    expect(posCategoryTreeSignature(tree)).toBe(posCategoryTreeSignature(tree));
    expect(posCategoryTreeSignature(renamed)).not.toBe(posCategoryTreeSignature(tree));
    expect(posCategoryTreeSignature([])).toBe("0-0-0");
  });
});

describe("collectionSlugsForWebId", () => {
  it("una categoría expira su URL y las de sus subcategorías", () => {
    expect(collectionSlugsForWebId(tree, "cat-b")).toEqual(["prendas-superiores", "camisas", "blusas"]);
  });

  it("una subcategoría expira solo su URL", () => {
    expect(collectionSlugsForWebId(tree, "sub-1")).toEqual(["blusas"]);
  });

  it("un webId desconocido no da rutas (queda la invalidación global)", () => {
    expect(collectionSlugsForWebId(tree, "cat-nueva")).toEqual([]);
    expect(collectionSlugsForWebId([], "cat-b")).toEqual([]);
  });
});
