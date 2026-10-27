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
  isPosCatalogConfigured: () => true,
  listCategories: jest.fn(),
}));
jest.mock("../application/sync-product.use-case", () => ({}));
jest.mock("../application/sync-order-status.use-case", () => ({}));
jest.mock("@/modules/shipping/application/pos-shipping", () => ({ clearShippingCache: jest.fn() }));
jest.mock("../application/verify-pos-admin.use-case", () => ({ clearPosAdminCache: jest.fn() }));
jest.mock("@/modules/catalog/product/infrastructure/prisma-product-web-settings.repository", () => ({
  PrismaProductWebSettingsRepository: jest.fn(),
}));

import { revalidatePath, revalidateTag } from "next/cache";
import { listCategories } from "../infrastructure/pos-catalog.client";
import { getPosCategoryTree, resetPosCategoryBackupForTests } from "../application/get-pos-categories.use-case";
import { processPosEvent } from "../application/process-pos-event.use-case";

const tree = [
  {
    webId: "cat-1",
    slug: "blusas",
    name: "Blusas",
    subcategories: [{ webId: "sub-1", parentWebId: "cat-1", slug: "blusas-mujer", name: "Mujer" }],
  },
];

describe("webhook de categorías: revalidación por slug", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(console, "info").mockImplementation(() => {});
    resetPosCategoryBackupForTests();
    (listCategories as jest.Mock).mockResolvedValue(tree);
    await getPosCategoryTree();
  });
  afterEach(() => jest.restoreAllMocks());

  it("category.upserted expira el tag y las URLs de la categoría y sus subcategorías", async () => {
    const result = await processPosEvent({ entityType: "category", id: "cat-1", action: "upserted" });

    expect(revalidateTag).toHaveBeenCalledWith("pos-categories", { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/collections");
    expect(revalidatePath).toHaveBeenCalledWith("/collections/blusas");
    expect(revalidatePath).toHaveBeenCalledWith("/collections/blusas-mujer");
    expect(result).toMatchObject({ status: "revalidated", collectionSlugs: ["blusas", "blusas-mujer"] });
  });

  it("subcategory.removed expira solo la URL de la subcategoría", async () => {
    await processPosEvent({ entityType: "subcategory", id: "sub-1", action: "removed" });
    expect(revalidatePath).toHaveBeenCalledWith("/collections/blusas-mujer");
    expect(revalidatePath).not.toHaveBeenCalledWith("/collections/blusas");
  });

  it("una categoría nueva (sin slug conocido) mantiene la invalidación global", async () => {
    await processPosEvent({ entityType: "category", id: "cat-nueva", action: "upserted" });
    expect(revalidateTag).toHaveBeenCalledWith("pos-categories", { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledTimes(1);
    expect(revalidatePath).toHaveBeenCalledWith("/collections");
  });
});
