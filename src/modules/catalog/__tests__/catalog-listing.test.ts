/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/lib/prisma", () => ({ prisma: {} }));
jest.mock("@/modules/posIntegration/infrastructure/pos-config", () => ({ isPosCatalogConfigured: jest.fn(() => true) }));
jest.mock("@/modules/posIntegration/infrastructure/pos-catalog.read", () => ({ fetchCatalogForRender: jest.fn() }));
jest.mock("../product/infrastructure/prisma-product-web-settings.repository", () => {
  const repo = { findAll: jest.fn() };
  return { PrismaProductWebSettingsRepository: jest.fn(() => repo), __settings: repo };
});
jest.mock("../listing/infrastructure/prisma-catalog-listing.repository", () => {
  const repo = { findActiveProducts: jest.fn() };
  return { PrismaCatalogListingRepository: jest.fn(() => repo), __repo: repo };
});
// Categorías y tipos de prenda: el árbol del POS (la web no los guarda).
jest.mock("@/modules/posIntegration/application/get-pos-taxonomy.use-case", () => ({ getPosTaxonomy: jest.fn() }));
jest.mock("@/modules/collections/infrastructure/pos-collection.repository", () => {
  const repo = { getCategoryBasicBySlug: jest.fn(), getGarmentTypeBySlug: jest.fn() };
  return { PosCollectionRepository: jest.fn(() => repo), __collections: repo };
});

import { posProductSchema } from "@/modules/posIntegration/contracts/pos-catalog.schema";
import { fetchCatalogForRender } from "@/modules/posIntegration/infrastructure/pos-catalog.read";
import { getPosTaxonomy } from "@/modules/posIntegration/application/get-pos-taxonomy.use-case";
import { buildPosTaxonomy } from "@/modules/posIntegration/domain/pos-category-view";
import {
  posToCatalogEntry,
  rankBySearch,
  toCard,
  type CatalogTaxonomy,
  type NeonCatalogRow,
  type WebSettings,
} from "../listing/domain/catalog-entry.entity";
import { getCatalog, getRecommendedEntries } from "../listing/application/get-catalog";
import { getCollectionProductsUseCase } from "@/modules/collections/application/get-collection-products.use-case";
import { getProductsByFlagUseCase } from "@/modules/collections/application/get-products-by-flag.use-case";
import { getNewProductsUseCase } from "@/modules/collections/application/get-new-products.use-case";

/* eslint-disable @typescript-eslint/no-require-imports */
const repo = require("../listing/infrastructure/prisma-catalog-listing.repository").__repo;
const settingsRepo = require("../product/infrastructure/prisma-product-web-settings.repository").__settings;
const collections = require("@/modules/collections/infrastructure/pos-collection.repository").__collections;
/* eslint-enable @typescript-eslint/no-require-imports */
const mockFetchCatalog = fetchCatalogForRender as jest.Mock;
const mockTaxonomy = getPosTaxonomy as jest.Mock;

function pos(slug: string, overrides: Record<string, unknown> = {}) {
  return posProductSchema.parse({
    slug,
    name: slug.replace(/-/g, " "),
    description: "Prenda de lino",
    salePrice: 90000,
    coverImageUrl: `/media/${slug}.jpg`,
    available: true,
    categoryWebId: "CAT-MUJER",
    subcategoryWebId: "SUB-BLUSAS",
    classifications: [{ categoryWebId: "CAT-MUJER", subcategoryWebId: "SUB-BLUSAS", garmentTypeSlug: "blusa" }],
    colors: [{ colorId: 1, name: "Arena", hexCode: "#d2b48c", media: [{ url: `/media/${slug}-arena.jpg` }] }],
    sizes: [{ sizeId: 2, name: "M" }],
    variants: [{ colorId: 1, sizeId: 2, available: true, lowStock: false }],
    updatedAt: "2026-10-01T00:00:00Z",
    ...overrides,
  });
}

const sub = (webId: string, slug: string, name: string, garmentType: { slug: string; name: string } | null = null) => ({
  webId,
  parentWebId: "CAT-MUJER",
  slug,
  name,
  description: null,
  imageUrl: null,
  metaTitle: null,
  metaDescription: null,
  sortOrder: 0,
  updatedAt: null,
  garmentType: garmentType ? { ...garmentType, sortOrder: 0 } : null,
});

/** Árbol publicado por el POS: Mujer › Blusas (tipo de prenda «Blusa»). */
const taxonomy: CatalogTaxonomy = buildPosTaxonomy([
  {
    webId: "CAT-MUJER",
    slug: "mujer",
    name: "Mujer",
    description: null,
    imageUrl: null,
    metaTitle: null,
    metaDescription: null,
    sortOrder: 0,
    updatedAt: null,
    subcategories: [sub("SUB-BLUSAS", "blusas", "Blusas", { slug: "blusa", name: "Blusa" })],
  },
]);

function settings(slug: string, overrides: Partial<WebSettings> = {}): WebSettings {
  return {
    metaTitle: null,
    metaDescription: null,
    coverImageUrl: null,
    videoUrl: null,
    isNew: false,
    isOnSale: false,
    isOnSaleAt: null,
    publishedAt: new Date("2026-09-01T00:00:00Z"),
    ...overrides,
  } as WebSettings & { slug?: string };
}

function webRow(slug: string, overrides: Partial<NeonCatalogRow> = {}): NeonCatalogRow {
  return {
    name: "Conjunto Venus",
    slug,
    description: "Set de dos piezas",
    metaTitle: null,
    metaDescription: null,
    basePrice: 150000,
    comparePrice: null,
    isFeatured: false,
    isNew: true,
    isSuggested: false,
    suggestedAt: null,
    isSet: true,
    isProductNew: false,
    isProductNewAt: null,
    isOnSale: false,
    coverImageUrl: null,
    createdAt: new Date("2026-08-01T00:00:00Z"),
    images: [{ url: "/set.jpg" }],
    items: [{ name: "Short", price: 70000, comparePrice: null, colors: [] }],
    colors: [],
    ...overrides,
  };
}

describe("posToCatalogEntry", () => {
  it("ubica el producto en las categorías del POS por webId y toma la capa web", () => {
    const entry = posToCatalogEntry(
      pos("blusa-lino", { labels: [{ code: "BEST_SELLER" }] }),
      settings("blusa-lino", { isNew: true, isOnSale: true, metaTitle: "Blusa fresca" }),
      taxonomy,
    );
    expect(entry).toEqual(
      expect.objectContaining({
        slug: "blusa-lino",
        isFeatured: true,
        isNew: true,
        categorySlugs: ["mujer", "blusas"],
        garmentTypeSlugs: ["blusa"],
        publishedAt: new Date("2026-09-01T00:00:00Z"),
      }),
    );
    expect(entry.card.isOnSale).toBe(true);
    expect(entry.search.metaTitle).toBe("Blusa fresca");
  });

  it("sin alta registrada se ordena por su última actualización en el POS", () => {
    expect(posToCatalogEntry(pos("nuevo"), null, taxonomy).publishedAt).toEqual(new Date("2026-10-01T00:00:00Z"));
  });

  it("la tarjeta lleva stock solo cuando se pide (badge Agotado del home)", () => {
    const entry = posToCatalogEntry(pos("blusa-lino"), null, taxonomy);
    expect(toCard(entry, true).colors[0].variants).toEqual([{ stock: 99 }]);
    expect(toCard(entry).colors[0].variants).toBeUndefined();
  });

  it("una categoría que el POS no publica (oculta o borrada) no ubica el producto", () => {
    const entry = posToCatalogEntry(
      pos("vestido", {
        categoryWebId: "CAT-OCULTA",
        subcategoryWebId: null,
        classifications: [{ categoryWebId: "CAT-OCULTA", subcategoryWebId: null, garmentTypeSlug: null }],
      }),
      null,
      taxonomy,
    );
    expect(entry.categorySlugs).toEqual([]);
  });

  it("sin categorías en el POS ningún producto queda en una colección", () => {
    const entry = posToCatalogEntry(pos("blusa-lino"), null, buildPosTaxonomy([]));
    expect(entry.categorySlugs).toEqual([]);
    expect(entry.search.categoryNames).toEqual([]);
  });

  it("la búsqueda encuentra por categoría y tipo de prenda", () => {
    const entry = posToCatalogEntry(pos("lino-arena"), null, taxonomy);
    expect(rankBySearch([entry], "blusas")).toHaveLength(1);
    expect(rankBySearch([entry], "pantalon")).toHaveLength(0);
  });
});

describe("getCatalog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTaxonomy.mockResolvedValue(taxonomy);
    settingsRepo.findAll.mockResolvedValue(
      new Map([
        ["blusa-lino", settings("blusa-lino", { publishedAt: new Date("2026-10-10T00:00:00Z") })],
        ["falda-midi", settings("falda-midi", { publishedAt: new Date("2026-07-01T00:00:00Z") })],
      ]),
    );
  });

  it("une POS y productos de la web, más nuevo primero", async () => {
    mockFetchCatalog.mockResolvedValue([pos("falda-midi"), pos("blusa-lino")]);
    repo.findActiveProducts.mockResolvedValue([webRow("conjunto-venus")]);

    const catalog = await getCatalog();

    expect(repo.findActiveProducts).toHaveBeenCalledWith(true);
    expect(catalog.map((e) => [e.slug, e.source])).toEqual([
      ["blusa-lino", "POS"],
      ["conjunto-venus", "NEON"],
      ["falda-midi", "POS"],
    ]);
  });

  it("si el POS no responde usa la copia en Neon de todo el catálogo", async () => {
    mockFetchCatalog.mockRejectedValue(new Error("timeout"));
    repo.findActiveProducts.mockResolvedValue([webRow("conjunto-venus")]);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);

    const catalog = await getCatalog();

    expect(repo.findActiveProducts).toHaveBeenLastCalledWith(false);
    expect(catalog.map((e) => e.slug)).toEqual(["conjunto-venus"]);
  });

  it("recomienda productos que comparten categoría, sin el propio", async () => {
    mockFetchCatalog.mockResolvedValue([pos("falda-midi"), pos("blusa-lino")]);
    repo.findActiveProducts.mockResolvedValue([webRow("conjunto-venus")]);
    const recommended = await getRecommendedEntries("blusa-lino");
    // Los productos creados en la web no tienen categoría (las categorías son del POS).
    expect(recommended.map((e) => e.slug)).toEqual(["falda-midi"]);
  });
});

describe("listados sobre el catálogo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTaxonomy.mockResolvedValue(taxonomy);
    settingsRepo.findAll.mockResolvedValue(new Map([["blusa-lino", settings("blusa-lino", { isNew: true })]]));
    mockFetchCatalog.mockResolvedValue([
      pos("blusa-lino"),
      pos("pantalon-lino", {
        classifications: [{ categoryWebId: "CAT-MUJER", subcategoryWebId: null, garmentTypeSlug: "pantalon" }],
        subcategoryWebId: null,
        labels: [{ code: "BEST_SELLER" }],
      }),
    ]);
    repo.findActiveProducts.mockResolvedValue([webRow("conjunto-venus")]);
  });

  it("colección por categoría y tipo de prenda", async () => {
    collections.getCategoryBasicBySlug.mockResolvedValue({ name: "Blusas" });
    collections.getGarmentTypeBySlug.mockResolvedValue({ slug: "blusa", name: "Blusa" });

    const blusas = await getCollectionProductsUseCase("blusas");
    expect(blusas.products.map((p) => p.slug)).toEqual(["blusa-lino"]);

    const mujerBlusa = await getCollectionProductsUseCase("mujer", "blusa");
    expect(mujerBlusa).toEqual(expect.objectContaining({ garmentTypeName: "Blusa" }));
    expect(mujerBlusa.products.map((p) => p.slug)).toEqual(["blusa-lino"]);
  });

  it("un ?tipo= inexistente no filtra", async () => {
    collections.getCategoryBasicBySlug.mockResolvedValue({ name: "Mujer" });
    collections.getGarmentTypeBySlug.mockResolvedValue(null);
    const result = await getCollectionProductsUseCase("mujer", "no-existe");
    expect(result.products.map((p) => p.slug).sort()).toEqual(["blusa-lino", "pantalon-lino"]);
  });

  it("una colección que el POS no publica responde vacía", async () => {
    collections.getCategoryBasicBySlug.mockResolvedValue(null);
    const result = await getCollectionProductsUseCase("no-existe");
    expect(result).toEqual(expect.objectContaining({ category: null, products: [] }));
  });

  it("más vendidos por etiqueta del POS y nueva colección por la bandera de la web", async () => {
    const featured = await getProductsByFlagUseCase({ isFeatured: true, status: "ACTIVE" });
    expect(featured.products.map((p) => p.slug)).toEqual(["pantalon-lino"]);

    const fresh = await getNewProductsUseCase(1);
    expect(fresh.items).toHaveLength(1);
    expect(fresh.hasMore).toBe(true);
  });
});
