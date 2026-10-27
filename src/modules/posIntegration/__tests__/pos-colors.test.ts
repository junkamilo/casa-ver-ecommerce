/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("next/cache", () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));
jest.mock("@/lib/revalidate-product-pages", () => ({ revalidateProductListings: jest.fn() }));
jest.mock("@/lib/prisma", () => ({ prisma: {} }));
jest.mock("../infrastructure/pos-catalog.read", () => ({
  POS_PRODUCTS_CACHE_TAG: "pos-products",
  posProductCacheTag: (slug: string) => `pos-product:${slug}`,
}));
jest.mock("../infrastructure/pos-catalog.client", () => ({
  isPosCatalogConfigured: jest.fn(() => true),
  listColors: jest.fn(),
  listCategories: jest.fn(),
}));
jest.mock("../application/sync-order-status.use-case", () => ({}));
jest.mock("@/modules/shipping/application/pos-shipping", () => ({ clearShippingCache: jest.fn() }));
jest.mock("@/modules/catalog/product/infrastructure/prisma-product-web-settings.repository", () => ({
  PrismaProductWebSettingsRepository: jest.fn(),
}));

import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateProductListings } from "@/lib/revalidate-product-pages";
import { isPosCatalogConfigured, listColors } from "../infrastructure/pos-catalog.client";
import {
  getPosColors,
  getPosColorsSnapshot,
  resetPosColorsBackupForTests,
} from "../application/get-pos-colors.use-case";
import { processPosEvent } from "../application/process-pos-event.use-case";
import { posColorFacetSchema, posProductSchema, posWebhookPayloadSchema } from "../contracts/pos-catalog.schema";
import { mapPosProduct } from "../domain/pos-mapper";

const mockList = listColors as jest.Mock;
const mockConfigured = isPosCatalogConfigured as jest.Mock;
const VERDE = { colorId: 1, name: "Verde Militar", hexCode: "#4B5320", totalProducts: 3 };

describe("colores del POS", () => {
  it("el contrato exige hex #RRGGBB y acepta el aviso de colores", () => {
    expect(posColorFacetSchema.safeParse({ ...VERDE, hexCode: "#FFF" }).success).toBe(false);
    expect(posColorFacetSchema.parse({ colorId: 3, name: "Terracota", hexCode: "#E2725B" }).totalProducts).toBe(0);
    expect(
      posWebhookPayloadSchema.safeParse({ eventId: "e1", event: "color.upserted", entityType: "color", id: "1", action: "upserted" })
        .success,
    ).toBe(true);
  });

  it("toma el texto alternativo de cada foto del POS", () => {
    const pos = posProductSchema.parse({
      slug: "camisa-lino",
      name: "Camisa Lino",
      salePrice: 90000,
      available: true,
      colors: [
        {
          colorId: 1,
          name: "Verde Militar",
          hexCode: "#4B5320",
          media: [{ url: "/a.jpg", cover: true, alt: "Camisa de lino verde" }, { url: "/b.jpg" }],
        },
      ],
    });
    expect(mapPosProduct(pos).colors[0].images.map((img) => img.altText)).toEqual(["Camisa de lino verde", null]);
  });
});

describe("getPosColors · respaldo", () => {
  beforeEach(() => {
    resetPosColorsBackupForTests();
    mockList.mockReset();
    mockConfigured.mockReturnValue(true);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it("sin colores creados en el POS no hay colores", async () => {
    mockList.mockResolvedValue([]);
    expect(await getPosColorsSnapshot()).toEqual({ colors: [], available: true });
  });

  it("si el POS cae sirve la última copia válida", async () => {
    mockList.mockResolvedValueOnce([VERDE]).mockRejectedValueOnce(new Error("POS respondió 503"));
    await getPosColors();
    expect(await getPosColors()).toEqual([VERDE]);
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Sirviendo respaldo"), "POS respondió 503");
  });

  it("sin copia previa y con el POS caído no muestra colores", async () => {
    mockList.mockRejectedValue(new Error("fetch failed"));
    expect(await getPosColorsSnapshot()).toEqual({ colors: [], available: false });
  });

  it("sin integración con el POS no consulta colores", async () => {
    mockConfigured.mockReturnValue(false);
    expect(await getPosColors()).toEqual([]);
    expect(mockList).not.toHaveBeenCalled();
  });
});

describe("aviso color.* del POS", () => {
  beforeEach(() => jest.clearAllMocks());

  it("expira la paleta, los listados y las fichas de producto", async () => {
    jest.spyOn(console, "info").mockImplementation(() => {});
    const result = await processPosEvent({ entityType: "color", id: "7", action: "removed" });

    expect(result).toEqual({ status: "revalidated", entityType: "color", id: "7" });
    expect(revalidateTag).toHaveBeenCalledWith("pos-colors", { expire: 0 });
    expect(revalidateProductListings).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/product/[slug]", "page");
    expect(revalidateTag).not.toHaveBeenCalledWith("pos-categories", expect.anything());
  });
});
