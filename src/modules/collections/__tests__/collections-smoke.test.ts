/** @jest-environment node */

// Smoke tests del módulo collections — cubren el mapper unificado (`transformProduct`)
// y `buildFilterOptions`. NO ejecuta llamadas a Prisma. Para validación end-to-end
// usar el smoke manual del plan (home, /collections, /collections/[slug], etc.).

import {
  transformProduct,
  buildFilterOptions,
  type RawCollectionProduct,
} from "@/modules/collections/domain/product-mapper.entity";

// ── Helpers ───────────────────────────────────────────────────────────────────

function baseProduct(overrides: Partial<RawCollectionProduct> = {}): RawCollectionProduct {
  return {
    name: "Test Product",
    slug: "test-product",
    basePrice: 100000,
    comparePrice: null,
    isSet: false,
    isProductNew: false,
    isProductNewAt: null,
    isOnSale: false,
    images: [{ url: "/img/p1.jpg" }],
    items: [],
    colors: [],
    ...overrides,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Collections — transformProduct (sin stock)", () => {
  it("mapea campos básicos sin variants ni badge", () => {
    const result = transformProduct(baseProduct());

    expect(result.name).toBe("Test Product");
    expect(result.slug).toBe("test-product");
    expect(result.price).toBe(100000);
    expect(result.images).toEqual(["/img/p1.jpg"]);
    expect(result.isSet).toBe(false);
    expect(result.oldPrice).toBeUndefined();
    expect(result.minPrice).toBeUndefined();
    expect(result.colors).toBeUndefined();
    // Sin variants → no se computa stock → no se gatilla badge "Agotado".
    expect(result.badge).toBeUndefined();
  });

  it("mapea oldPrice desde comparePrice del padre cuando NO es set", () => {
    const result = transformProduct(
      baseProduct({ comparePrice: 120000, isOnSale: true }),
    );
    expect(result.oldPrice).toBe(120000);
    expect(result.badge).toBe("En Oferta");
  });

  it("mapea colores del padre con su primera imagen", () => {
    const result = transformProduct(
      baseProduct({
        colors: [
          {
            name: "Rojo",
            hexCode: "#ff0000",
            images: [{ url: "/img/red-1.jpg" }, { url: "/img/red-2.jpg" }],
          },
        ],
      }),
    );
    expect(result.colors).toEqual([
      { name: "Rojo", hexCode: "#ff0000", imageUrl: "/img/red-1.jpg" },
    ]);
  });
});

describe("Collections — transformProduct (sets)", () => {
  it("usa items[0].comparePrice como oldPrice para sets", () => {
    const result = transformProduct(
      baseProduct({
        isSet: true,
        comparePrice: 999999, // ignorado para sets
        items: [
          {
            price: 50000,
            comparePrice: 70000,
            colors: [{ name: "Beige", hexCode: "#beb", images: [] }],
          },
          {
            price: 60000,
            comparePrice: 80000,
            colors: [{ name: "Negro", hexCode: "#000", images: [] }],
          },
        ],
      }),
    );
    expect(result.oldPrice).toBe(70000);
    expect(result.minPrice).toBe(50000);
    expect(result.isSet).toBe(true);
  });

  it("hace fallback a items[0].colors[0].images cuando el padre no tiene imágenes", () => {
    const result = transformProduct(
      baseProduct({
        isSet: true,
        images: [],
        items: [
          {
            price: 30000,
            colors: [
              {
                name: "Blanco",
                hexCode: "#fff",
                images: [{ url: "/img/set-a.jpg" }, { url: "/img/set-b.jpg" }],
              },
            ],
          },
        ],
      }),
    );
    expect(result.images).toEqual(["/img/set-a.jpg", "/img/set-b.jpg"]);
  });

  it("usa items[0].colors como firstItemColors fallback cuando el padre no tiene colores", () => {
    const result = transformProduct(
      baseProduct({
        isSet: true,
        colors: [],
        items: [
          {
            price: 30000,
            colors: [
              {
                name: "Verde",
                hexCode: "#0f0",
                images: [{ url: "/img/g.jpg" }],
              },
              { name: "Azul", hexCode: "#00f", images: [] },
            ],
          },
        ],
      }),
    );
    expect(result.colors).toEqual([
      { name: "Verde", hexCode: "#0f0", imageUrl: "/img/g.jpg" },
      { name: "Azul", hexCode: "#00f", imageUrl: null },
    ]);
  });

  it("calcula minPrice ignorando items sin price", () => {
    const result = transformProduct(
      baseProduct({
        isSet: true,
        items: [
          { price: 10000, colors: [] },
          { price: null, colors: [] },
          { price: 5000, colors: [] },
        ],
      }),
    );
    expect(result.minPrice).toBe(5000);
  });
});

describe("Collections — transformProduct (con stock)", () => {
  it("badge 'Agotado' cuando todos los variants tienen stock 0", () => {
    const result = transformProduct(
      baseProduct({
        colors: [
          {
            name: "Negro",
            hexCode: "#000",
            images: [],
            variants: [{ stock: 0 }, { stock: 0 }],
          },
        ],
      }),
    );
    expect(result.badge).toBe("Agotado");
  });

  it("badge 'En Oferta' cuando hay stock y isOnSale=true", () => {
    const result = transformProduct(
      baseProduct({
        isOnSale: true,
        colors: [
          {
            name: "Rojo",
            hexCode: "#ff0",
            images: [],
            variants: [{ stock: 5 }],
          },
        ],
      }),
    );
    expect(result.badge).toBe("En Oferta");
  });

  it("para sets, agrega stock de items[].colors[].variants", () => {
    const result = transformProduct(
      baseProduct({
        isSet: true,
        colors: [
          // Padre puede tener stock, pero para sets se usa el de items.
          { name: "X", hexCode: "#x", images: [], variants: [{ stock: 999 }] },
        ],
        items: [
          {
            price: 1000,
            colors: [
              {
                name: "A",
                hexCode: "#a",
                images: [],
                variants: [{ stock: 0 }],
              },
            ],
          },
          {
            price: 2000,
            colors: [
              {
                name: "B",
                hexCode: "#b",
                images: [],
                variants: [{ stock: 0 }],
              },
            ],
          },
        ],
      }),
    );
    expect(result.badge).toBe("Agotado");
  });
});

describe("Collections — buildFilterOptions", () => {
  it("acumula colores únicos por hexCode y maxPriceDb", () => {
    const products = [
      baseProduct({
        basePrice: 50000,
        colors: [
          { name: "Rojo", hexCode: "#f00", images: [] },
          { name: "Azul", hexCode: "#00f", images: [] },
        ],
      }),
      baseProduct({
        basePrice: 80000,
        colors: [
          { name: "Rojo Diferente Nombre", hexCode: "#f00", images: [] },
          { name: "Verde", hexCode: "#0f0", images: [] },
        ],
      }),
    ];

    const result = buildFilterOptions(products);

    expect(result.maxPriceDb).toBe(80000);
    expect(result.availableColors).toHaveLength(3);
    const hexCodes = result.availableColors.map((c) => c.hexCode).sort();
    expect(hexCodes).toEqual(["#00f", "#0f0", "#f00"]);
  });

  it("maxPriceDb = 0 con lista vacía", () => {
    expect(buildFilterOptions([])).toEqual({
      availableColors: [],
      maxPriceDb: 0,
    });
  });
});
