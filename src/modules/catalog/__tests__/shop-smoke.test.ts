/** @jest-environment node */

// Smoke tests del subm\u00f3dulo catalog/shop \u2014 cubren el parser de filtros
// (interno al use case) y el mapper unificado heredado del m\u00f3dulo collections.
// El parser se exporta indirectamente a trav\u00e9s del use case mockeando el repo.

// Para mantener el test puro (sin Prisma), hacemos `jest.mock` del repo y
// validamos que la conversi\u00f3n filters \u2192 where + transformProduct + filterOptions
// funcione end-to-end del use case.

import type { Prisma } from "@prisma/client";

const findManyMock = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: (...args: unknown[]) => findManyMock(...args),
    },
  },
}));

import { getShopProductsUseCase } from "@/modules/catalog/shop/application/get-shop-products.use-case";

beforeEach(() => {
  findManyMock.mockReset();
});

function mockTwoQueries(allRows: unknown[], filteredRows: unknown[]) {
  findManyMock
    .mockResolvedValueOnce(allRows) // primera llamada: filterOptions
    .mockResolvedValueOnce(filteredRows); // segunda: filtrados
}

describe("getShopProductsUseCase \u2014 filterOptions builder", () => {
  it("acumula colores \u00fanicos por hexCode y maxPriceDb", async () => {
    mockTwoQueries(
      [
        {
          basePrice: 50000,
          colors: [
            { name: "Rojo", hexCode: "#f00" },
            { name: "Azul", hexCode: "#00f" },
          ],
        },
        {
          basePrice: 80000,
          colors: [
            { name: "Rojo Otro", hexCode: "#f00" },
            { name: "Verde", hexCode: "#0f0" },
          ],
        },
      ],
      [],
    );

    const result = await getShopProductsUseCase({});

    expect(result.filterOptions.maxPriceDb).toBe(80000);
    expect(result.filterOptions.availableColors).toHaveLength(3);
    const hexes = result.filterOptions.availableColors.map((c) => c.hexCode).sort();
    expect(hexes).toEqual(["#00f", "#0f0", "#f00"]);
  });
});

describe("getShopProductsUseCase \u2014 where builder desde filtros", () => {
  it("aplica gte/lte cuando minPrice/maxPrice est\u00e1n presentes", async () => {
    mockTwoQueries([], []);
    await getShopProductsUseCase({ minPrice: "100", maxPrice: "500" });

    const callArgs = findManyMock.mock.calls[1][0] as { where: Prisma.ProductWhereInput };
    expect(callArgs.where.basePrice).toEqual({ gte: 100, lte: 500 });
    expect(callArgs.where.status).toBe("ACTIVE");
  });

  it("aplica solo gte cuando hay minPrice sin maxPrice", async () => {
    mockTwoQueries([], []);
    await getShopProductsUseCase({ minPrice: "200" });

    const callArgs = findManyMock.mock.calls[1][0] as { where: Prisma.ProductWhereInput };
    expect(callArgs.where.basePrice).toEqual({ gte: 200 });
  });

  it("agrega prefijo # al filtro de color", async () => {
    mockTwoQueries([], []);
    await getShopProductsUseCase({ color: "ff0000" });

    const callArgs = findManyMock.mock.calls[1][0] as { where: Prisma.ProductWhereInput };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereColors = callArgs.where.colors as any;
    expect(whereColors).toEqual({ some: { hexCode: "#ff0000" } });
  });

  it("sin filtros, where solo contiene status: ACTIVE", async () => {
    mockTwoQueries([], []);
    await getShopProductsUseCase({});

    const callArgs = findManyMock.mock.calls[1][0] as { where: Prisma.ProductWhereInput };
    expect(callArgs.where).toEqual({ status: "ACTIVE" });
  });
});

describe("getShopProductsUseCase \u2014 robustez ante errores", () => {
  it("devuelve resultado vac\u00edo si la query lanza", async () => {
    findManyMock.mockRejectedValueOnce(new Error("DB down"));

    const result = await getShopProductsUseCase({});
    expect(result).toEqual({
      products: [],
      filterOptions: { availableColors: [], maxPriceDb: 0 },
    });
  });
});

describe("getShopProductsUseCase \u2014 transforma productos al CollectionProduct", () => {
  it("mapea producto simple con badge En Oferta y oldPrice", async () => {
    mockTwoQueries(
      [],
      [
        {
          name: "Camisa",
          slug: "camisa",
          basePrice: 60000,
          comparePrice: 80000,
          isSet: false,
          isProductNew: false,
          isProductNewAt: null,
          isOnSale: true,
          images: [{ url: "/img1.jpg" }, { url: "/img2.jpg" }],
          items: [],
          colors: [
            {
              name: "Negro",
              hexCode: "#000",
              images: [{ url: "/black.jpg" }],
            },
          ],
        },
      ],
    );

    const result = await getShopProductsUseCase({});
    expect(result.products).toHaveLength(1);
    const product = result.products[0];
    expect(product.name).toBe("Camisa");
    expect(product.price).toBe(60000);
    expect(product.oldPrice).toBe(80000);
    expect(product.images).toEqual(["/img1.jpg", "/img2.jpg"]);
    expect(product.badge).toBe("En Oferta");
    expect(product.colors).toEqual([
      { name: "Negro", hexCode: "#000", imageUrl: "/black.jpg" },
    ]);
  });
});
