/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("next/cache", () => ({
  unstable_cache: (fn: () => unknown) => fn,
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));
jest.mock("@/lib/revalidate-product-pages", () => ({ revalidateProductListings: jest.fn() }));
jest.mock("../infrastructure/pos-catalog.read", () => ({
  POS_PRODUCTS_CACHE_TAG: "pos-products",
  posProductCacheTag: (slug: string) => `pos-product:${slug}`,
}));
jest.mock("../infrastructure/pos-catalog.client", () => ({
  isPosCatalogConfigured: jest.fn(() => true),
  listCategories: jest.fn(),
}));

import { isPosCatalogConfigured, listCategories } from "../infrastructure/pos-catalog.client";
import {
  getPosCategoryTree,
  getPosCategoryTreeSnapshot,
  resetPosCategoryBackupForTests,
} from "../application/get-pos-categories.use-case";
import type { PosCategory } from "../contracts/pos-catalog.schema";

const mockList = listCategories as jest.Mock;
const mockConfigured = isPosCatalogConfigured as jest.Mock;
const tree = [{ webId: "cat-1", name: "Blusas", slug: "blusas" }] as unknown as PosCategory[];

describe("getPosCategoryTree · last known good (H-01)", () => {
  beforeEach(() => {
    resetPosCategoryBackupForTests();
    mockList.mockReset();
    mockConfigured.mockReturnValue(true);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it("devuelve el árbol fresco cuando el POS responde", async () => {
    mockList.mockResolvedValue(tree);
    expect(await getPosCategoryTreeSnapshot()).toEqual({ tree, available: true });
  });

  it("si el POS cae, sirve la última copia válida en vez de vaciar la tienda", async () => {
    mockList.mockResolvedValueOnce(tree).mockRejectedValueOnce(new Error("POS respondió 503"));
    await getPosCategoryTree();
    expect(await getPosCategoryTreeSnapshot()).toEqual({ tree, available: true });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("Sirviendo respaldo"), "POS respondió 503");
  });

  it("sin respaldo previo, una caída deja el árbol vacío y marcado como no disponible", async () => {
    mockList.mockRejectedValue(new Error("ECONNREFUSED"));
    expect(await getPosCategoryTreeSnapshot()).toEqual({ tree: [], available: false });
  });

  it("una respuesta OK vacía es la verdad del POS y reemplaza la copia", async () => {
    mockList.mockResolvedValueOnce(tree).mockResolvedValueOnce([]).mockRejectedValueOnce(new Error("caído"));
    await getPosCategoryTree();
    expect(await getPosCategoryTree()).toEqual([]);
    expect(await getPosCategoryTreeSnapshot()).toEqual({ tree: [], available: true });
  });

  it("sin POS configurado no consulta nada", async () => {
    mockConfigured.mockReturnValue(false);
    expect(await getPosCategoryTreeSnapshot()).toEqual({ tree: [], available: true });
    expect(mockList).not.toHaveBeenCalled();
  });
});
