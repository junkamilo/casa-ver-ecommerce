/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/lib/prisma", () => ({ prisma: {} }));
jest.mock("@/modules/posIntegration/infrastructure/pos-catalog.read", () => ({ fetchProductForRender: jest.fn() }));
jest.mock("@/modules/posIntegration/infrastructure/pos-config", () => ({ isPosCatalogConfigured: jest.fn(() => true) }));
jest.mock("../product/infrastructure/prisma-product-detail.repository", () => {
  const repo = { findNeonProduct: jest.fn() };
  return { PrismaProductDetailRepository: jest.fn(() => repo), __repo: repo };
});
jest.mock("../product/infrastructure/prisma-product-web-settings.repository", () => {
  const repo = { findBySlug: jest.fn() };
  return { PrismaProductWebSettingsRepository: jest.fn(() => repo), __settings: repo };
});

import { posProductSchema } from "@/modules/posIntegration/contracts/pos-catalog.schema";
import { mapPosProduct } from "@/modules/posIntegration/domain/pos-mapper";
import { fetchProductForRender } from "@/modules/posIntegration/infrastructure/pos-catalog.read";
import { posProductSeo, posToRawProductDetail, type ProductWebOverlay } from "../product/domain/pos-product-detail.entity";
import { mapUIProduct, mapUIItems, resolveGalleryAndVideo } from "../product/domain/product-detail.entity";
import { resolveProductSource } from "../product/application/resolve-product-source";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const repo = require("../product/infrastructure/prisma-product-detail.repository").__repo;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const settingsRepo = require("../product/infrastructure/prisma-product-web-settings.repository").__settings;
const mockFetch = fetchProductForRender as jest.Mock;

const pos = posProductSchema.parse({
  slug: "blusa-lino",
  name: "Blusa Lino",
  description: "Blusa de lino fresca",
  salePrice: 89000,
  displayPrice: 120000,
  coverImageUrl: "/media/blusa-cover.jpg",
  available: true,
  colors: [{ colorId: 1, name: "Arena", hexCode: "#d2b48c", media: [{ url: "/media/arena-1.jpg" }] }],
  sizes: [
    { sizeId: 2, name: "M" },
    { sizeId: 3, name: "L" },
  ],
  variants: [
    { colorId: 1, sizeId: 2, available: true, lowStock: false },
    { colorId: 1, sizeId: 3, available: false, lowStock: false },
  ],
  labels: [{ code: "PRODUCT_NEW", assignedAt: "2026-10-18T00:00:00Z" }],
});

const overlay: ProductWebOverlay = {
  metaTitle: "Blusa de lino | Casa Verde",
  metaDescription: null,
  coverImageUrl: "https://cdn.casaverde.example/portada-web.jpg",
  videoUrl: null,
  isOnSale: true,
  isOnSaleAt: null,
};

describe("posToRawProductDetail", () => {
  it("identifica el producto por slug y cada variante por el SKU del POS", () => {
    const raw = posToRawProductDetail(mapPosProduct(pos), null);
    const ui = mapUIProduct(raw, mapUIItems([]), 99, 0, 0, null, resolveGalleryAndVideo(raw).allGeneralImages);

    expect(ui.id).toBe("blusa-lino");
    expect(ui.basePrice).toBe(89000);
    expect(ui.comparePrice).toBe(120000);
    expect(ui.generalImages).toEqual(["/media/blusa-cover.jpg"]);
    expect(ui.colors[0].variants).toEqual([{ size: "M", variantId: "pos-blusa-lino-1-2", sku: "pos-blusa-lino-1-2" }]);
    expect(ui.colors[0].availableSizes).toEqual(["M"]);
  });

  it("respeta la portada puesta a mano en la web y la oferta manual", () => {
    const raw = posToRawProductDetail(mapPosProduct(pos), overlay);
    expect(raw.coverImageUrl).toBe(overlay.coverImageUrl);
    expect(raw.isOnSale).toBe(true);
    expect(raw.isProductNew).toBe(true);
  });

  it("una portada elegida entre las fotos del POS vale mientras el producto la tenga", () => {
    const chosen = posToRawProductDetail(mapPosProduct(pos), { ...overlay, coverImageUrl: "/media/arena-1.jpg" });
    expect(chosen.coverImageUrl).toBe("/media/arena-1.jpg");
    const gone = posToRawProductDetail(mapPosProduct(pos), { ...overlay, coverImageUrl: "/media/borrada.jpg" });
    expect(gone.coverImageUrl).toBe("/media/blusa-cover.jpg");
  });

  it("sin oferta manual ni etiqueta ON_SALE no está en oferta", () => {
    const raw = posToRawProductDetail(mapPosProduct(pos), { ...overlay, isOnSale: false });
    expect(raw.isOnSale).toBe(false);
  });

  it("usa el SEO de la web o el que creaba la sincronización", () => {
    expect(posProductSeo(mapPosProduct(pos), overlay)).toEqual(
      expect.objectContaining({ metaTitle: "Blusa de lino | Casa Verde", metaDescription: "Blusa de lino fresca" }),
    );
    expect(posProductSeo(mapPosProduct(pos), null).metaTitle).toBe("Blusa Lino");
  });
});

describe("resolveProductSource", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    settingsRepo.findBySlug.mockResolvedValue(null);
  });

  it("un producto creado solo en la web ya no se vende (404) y no consulta al POS", async () => {
    repo.findNeonProduct.mockResolvedValue({ id: "clxweb", status: "ACTIVE", posSlug: null });
    await expect(resolveProductSource("vestido-web")).resolves.toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("un producto del POS se lee del POS con la capa web, aunque no tenga copia en Neon", async () => {
    repo.findNeonProduct.mockResolvedValue(null);
    settingsRepo.findBySlug.mockResolvedValue(overlay);
    mockFetch.mockResolvedValue(pos);
    await expect(resolveProductSource("blusa-lino")).resolves.toEqual({ source: "POS", pos, overlay });
  });

  it("si el POS lo oculta (404) la página es 404 aunque quede la copia", async () => {
    repo.findNeonProduct.mockResolvedValue({ id: "clxpos", status: "ACTIVE", posSlug: "falda" });
    mockFetch.mockResolvedValue(null);
    await expect(resolveProductSource("falda")).resolves.toBeNull();
  });

  it("si el POS no responde usa la copia en Neon", async () => {
    repo.findNeonProduct.mockResolvedValue({ id: "clxpos", status: "ACTIVE", posSlug: "top" });
    mockFetch.mockRejectedValue(new Error("timeout"));
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    await expect(resolveProductSource("top")).resolves.toEqual({ source: "NEON_LEGACY" });
  });
});
