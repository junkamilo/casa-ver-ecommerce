/** @jest-environment node */

import type { CatalogEntry } from "@/modules/catalog/listing/domain/catalog-entry.entity";

const getCatalogMock = jest.fn();
const captureExceptionMock = jest.fn();
const withScopeMock = jest.fn((cb: (scope: { setTag: jest.Mock; setExtra: jest.Mock }) => void) => {
  cb({ setTag: jest.fn(), setExtra: jest.fn() });
});
const startSpanMock = jest.fn((_opts: unknown, fn: () => unknown) => fn());

jest.mock("@sentry/nextjs", () => ({
  withScope: (cb: Parameters<typeof withScopeMock>[0]) => withScopeMock(cb),
  captureException: (error: unknown) => captureExceptionMock(error),
  startSpan: (opts: unknown, fn: () => unknown) => startSpanMock(opts, fn),
}));

jest.mock("@/modules/catalog/listing/application/get-catalog", () => ({
  getCatalog: () => getCatalogMock(),
}));

import { getShopProductsUseCase } from "@/modules/catalog/shop/application/get-shop-products.use-case";

function entry(slug: string, overrides: Partial<CatalogEntry["card"]> = {}, name = slug): CatalogEntry {
  return {
    slug,
    source: "POS",
    card: {
      name,
      slug,
      basePrice: 50000,
      comparePrice: null,
      isSet: false,
      isProductNew: false,
      isProductNewAt: null,
      isOnSale: false,
      coverImageUrl: null,
      images: [],
      items: [],
      colors: [{ name: "Negro", hexCode: "#000000", images: [{ url: "/black.jpg" }] }],
      ...overrides,
    },
    publishedAt: new Date(0),
    isFeatured: false,
    isNew: false,
    isSuggested: false,
    suggestedAt: null,
    categorySlugs: [],
    garmentTypeSlugs: [],
    search: {
      name,
      slug,
      metaTitle: null,
      metaDescription: null,
      description: "",
      garmentTypeNames: [],
      categoryNames: [],
      itemNames: [],
    },
  };
}

beforeEach(() => {
  getCatalogMock.mockReset();
  captureExceptionMock.mockReset();
});

describe("getShopProductsUseCase — filterOptions", () => {
  it("acumula colores únicos por hexCode y maxPriceDb sobre todo el catálogo", async () => {
    getCatalogMock.mockResolvedValue([
      entry("a", { colors: [{ name: "Rojo", hexCode: "#f00", images: [] }, { name: "Azul", hexCode: "#00f", images: [] }] }),
      entry("b", {
        basePrice: 80000,
        colors: [{ name: "Rojo Otro", hexCode: "#f00", images: [] }, { name: "Verde", hexCode: "#0f0", images: [] }],
      }),
    ]);

    const result = await getShopProductsUseCase({ color: "0f0" });

    expect(result.filterOptions.maxPriceDb).toBe(80000);
    expect(result.filterOptions.availableColors.map((c) => c.hexCode).sort()).toEqual(["#00f", "#0f0", "#f00"]);
  });
});

describe("getShopProductsUseCase — filtros", () => {
  it("aplica precio mínimo y máximo", async () => {
    getCatalogMock.mockResolvedValue([
      entry("barata", { basePrice: 50 }),
      entry("media", { basePrice: 300 }),
      entry("cara", { basePrice: 900 }),
    ]);
    const result = await getShopProductsUseCase({ minPrice: "100", maxPrice: "500" });
    expect(result.products.map((p) => p.slug)).toEqual(["media"]);
  });

  it("filtra por color con el prefijo # y sin distinguir mayúsculas", async () => {
    getCatalogMock.mockResolvedValue([
      entry("roja", { colors: [{ name: "Rojo", hexCode: "#FF0000", images: [] }] }),
      entry("negra"),
    ]);
    const result = await getShopProductsUseCase({ color: "ff0000" });
    expect(result.products.map((p) => p.slug)).toEqual(["roja"]);
  });

  it("filtra por búsqueda con 2+ caracteres y la ignora con menos", async () => {
    getCatalogMock.mockResolvedValue([entry("pantalon-vision", {}, "Pantalón Visión"), entry("blusa", {}, "Blusa")]);
    expect((await getShopProductsUseCase({ q: "pantalones" })).products.map((p) => p.slug)).toEqual([
      "pantalon-vision",
    ]);
    expect((await getShopProductsUseCase({ q: "p" })).totalProducts).toBe(2);
  });
});

describe("getShopProductsUseCase — paginación", () => {
  it("pagina de a 24 y acota la página pedida", async () => {
    getCatalogMock.mockResolvedValue(Array.from({ length: 30 }, (_, i) => entry(`p-${i}`)));
    const second = await getShopProductsUseCase({ page: "2" });
    expect(second).toEqual(expect.objectContaining({ page: 2, totalPages: 2, totalProducts: 30 }));
    expect(second.products).toHaveLength(6);
    expect((await getShopProductsUseCase({ page: "99" })).page).toBe(2);
  });
});

describe("getShopProductsUseCase — robustez ante errores", () => {
  it("propaga el error y reporta a Sentry si la lectura lanza", async () => {
    getCatalogMock.mockRejectedValueOnce(new Error("DB down"));
    await expect(getShopProductsUseCase({})).rejects.toThrow("DB down");
    expect(captureExceptionMock).toHaveBeenCalled();
  });
});

describe("getShopProductsUseCase — transforma productos al CollectionProduct", () => {
  it("mapea producto simple con badge En Oferta y oldPrice", async () => {
    getCatalogMock.mockResolvedValue([entry("camisa", { basePrice: 60000, comparePrice: 80000, isOnSale: true })]);
    const result = await getShopProductsUseCase({});
    expect(result.products).toHaveLength(1);
    expect(result.products[0]).toEqual(expect.objectContaining({ badge: "En Oferta", oldPrice: 80000 }));
  });
});
