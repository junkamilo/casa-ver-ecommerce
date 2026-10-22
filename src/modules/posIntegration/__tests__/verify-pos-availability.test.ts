/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/lib/prisma", () => ({ prisma: {} }));
jest.mock("../application/sync-product.use-case", () => ({ upsertPosProduct: jest.fn().mockResolvedValue(undefined) }));
jest.mock("../infrastructure/pos-catalog.client", () => ({
  isPosCatalogConfigured: () => true,
  checkPosStock: jest.fn(),
  getProduct: jest.fn(),
}));
jest.mock("../infrastructure/prisma-pos-sync.repository", () => {
  const repo = {
    findVariantsForAvailabilityCheck: jest.fn(),
    hideProductByPosSlug: jest.fn().mockResolvedValue(null),
  };
  return { PrismaPosSyncRepository: jest.fn(() => repo), __repo: repo };
});

import { verifyPosAvailability } from "../application/verify-pos-availability.use-case";
import { checkPosStock, getProduct } from "../infrastructure/pos-catalog.client";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const repo = require("../infrastructure/prisma-pos-sync.repository").__repo;
const mockCheck = checkPosStock as jest.Mock;
const mockGetProduct = getProduct as jest.Mock;

const neonVariant = {
  id: "clxneonvariant01",
  sku: "pos-blusa-lino-1-2",
  size: "M",
  color: { name: "Arena" },
  product: { posSlug: "BLUSA-LINO" },
};

beforeEach(() => {
  jest.clearAllMocks();
  repo.findVariantsForAvailabilityCheck.mockResolvedValue([]);
});

describe("verifyPosAvailability con los dos formatos de variantId", () => {
  it("arma las líneas del SKU del POS sin consultar Neon y suma la misma prenda en ambos formatos", async () => {
    repo.findVariantsForAvailabilityCheck.mockResolvedValue([neonVariant]);
    mockCheck.mockResolvedValue({ available: true, problems: [] });

    const issues = await verifyPosAvailability([
      { variantId: "pos-blusa-lino-1-2", quantity: 1 },
      { variantId: "clxneonvariant01", quantity: 2 },
      { variantId: "pos-falda-midi-4-5", quantity: 1 },
    ]);

    expect(issues).toEqual([]);
    expect(repo.findVariantsForAvailabilityCheck).toHaveBeenCalledWith(["clxneonvariant01"]);
    expect(mockCheck).toHaveBeenCalledWith([
      expect.objectContaining({ productSlug: "blusa-lino", colorId: 1, sizeId: 2, quantity: 3 }),
      expect.objectContaining({ productSlug: "falda-midi", colorId: 4, sizeId: 5, quantity: 1 }),
    ]);
  });

  it("devuelve el problema del POS a cada variantId que pidió esa prenda", async () => {
    repo.findVariantsForAvailabilityCheck.mockResolvedValue([neonVariant]);
    mockCheck.mockResolvedValue({
      available: false,
      problems: [{ productSlug: "blusa-lino", colorId: 1, sizeId: 2, requested: 3, available: 1, message: "solo queda 1" }],
    });
    mockGetProduct.mockResolvedValue(null);

    const issues = await verifyPosAvailability([
      { variantId: "pos-blusa-lino-1-2", quantity: 1 },
      { variantId: "clxneonvariant01", quantity: 2 },
    ]);

    expect(issues).toEqual([
      { variantId: "pos-blusa-lino-1-2", reason: "out_of_stock", message: "solo queda 1" },
      { variantId: "clxneonvariant01", reason: "out_of_stock", message: "solo queda 1" },
    ]);
  });

  it("si /orders/check falla usa la disponibilidad publicada por color y talla del POS", async () => {
    mockCheck.mockRejectedValue(new Error("timeout"));
    mockGetProduct.mockResolvedValue({
      slug: "blusa-lino",
      variants: [
        { colorId: 1, sizeId: 2, available: false, lowStock: false },
        { colorId: 1, sizeId: 3, available: true, lowStock: false },
      ],
    });

    const issues = await verifyPosAvailability([
      { variantId: "pos-blusa-lino-1-2", quantity: 1 },
      { variantId: "pos-blusa-lino-1-3", quantity: 1 },
    ]);

    expect(issues).toEqual([{ variantId: "pos-blusa-lino-1-2", reason: "out_of_stock" }]);
  });

  it("ignora los productos de la web (sin posSlug)", async () => {
    const issues = await verifyPosAvailability([{ variantId: "clxwebonly0001", quantity: 1 }]);
    expect(issues).toEqual([]);
    expect(mockCheck).not.toHaveBeenCalled();
  });
});
