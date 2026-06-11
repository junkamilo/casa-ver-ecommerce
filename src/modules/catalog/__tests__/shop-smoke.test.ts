/** @jest-environment node */

import type { Prisma } from "@prisma/client";

const findManyMock = jest.fn();
const countMock = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: (...args: unknown[]) => findManyMock(...args),
      count: (...args: unknown[]) => countMock(...args),
    },
  },
}));

import { getShopProductsUseCase } from "@/modules/catalog/shop/application/get-shop-products.use-case";
import { TIENDA_PAGE_SIZE } from "@/modules/catalog/shop/contracts/shop.dto";

beforeEach(() => {
  findManyMock.mockReset();
  countMock.mockReset();
});

function mockShopQueries(
  allRows: unknown[],
  totalProducts: number,
  filteredRows: unknown[],
) {
  findManyMock
    .mockResolvedValueOnce(allRows)
    .mockResolvedValueOnce(filteredRows);
  countMock.mockResolvedValueOnce(totalProducts);
}

const EMPTY_RESULT = {
  products: [],
  filterOptions: { availableColors: [], maxPriceDb: 0 },
  page: 1,
  pageSize: TIENDA_PAGE_SIZE,
  totalProducts: 0,
  totalPages: 1,
};

describe("getShopProductsUseCase — filterOptions builder", () => {
  it("acumula colores únicos por hexCode y maxPriceDb", async () => {
    mockShopQueries(
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
      0,
      [],
    );

    const result = await getShopProductsUseCase({});

    expect(result.filterOptions.maxPriceDb).toBe(80000);
    expect(result.filterOptions.availableColors).toHaveLength(3);
    const hexes = result.filterOptions.availableColors.map((c) => c.hexCode).sort();
    expect(hexes).toEqual(["#00f", "#0f0", "#f00"]);
  });
});

describe("getShopProductsUseCase — where builder desde filtros", () => {
  it("aplica gte/lte cuando minPrice/maxPrice están presentes", async () => {
    mockShopQueries([], 0, []);
    await getShopProductsUseCase({ minPrice: "100", maxPrice: "500" });

    expect(countMock.mock.calls[0][0].where.basePrice).toEqual({
      gte: 100,
      lte: 500,
    });
    const pagedCall = findManyMock.mock.calls[1][0] as {
      where: Prisma.ProductWhereInput;
    };
    expect(pagedCall.where.status).toBe("ACTIVE");
  });

  it("agrega prefijo # al filtro de color", async () => {
    mockShopQueries([], 0, []);
    await getShopProductsUseCase({ color: "ff0000" });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereColors = countMock.mock.calls[0][0].where.colors as any;
    expect(whereColors).toEqual({ some: { hexCode: "#ff0000" } });
  });
});

describe("getShopProductsUseCase — robustez ante errores", () => {
  it("devuelve resultado vacío si la query lanza", async () => {
    findManyMock.mockRejectedValueOnce(new Error("DB down"));

    const result = await getShopProductsUseCase({});
    expect(result).toEqual(EMPTY_RESULT);
  });
});

describe("getShopProductsUseCase — transforma productos al CollectionProduct", () => {
  it("mapea producto simple con badge En Oferta y oldPrice", async () => {
    mockShopQueries(
      [],
      1,
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
    expect(result.totalProducts).toBe(1);
    expect(result.page).toBe(1);
    expect(result.products[0].badge).toBe("En Oferta");
  });
});
