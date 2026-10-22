/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/lib/prisma", () => ({ prisma: { productVariant: { findUnique: jest.fn() } } }));
jest.mock("@/modules/posIntegration/infrastructure/pos-catalog.client", () => ({ getProduct: jest.fn() }));

import { prisma } from "@/lib/prisma";
import { getProduct } from "@/modules/posIntegration/infrastructure/pos-catalog.client";
import { resolvePosLinePrices } from "../infrastructure/pos-line-prices";
import { ProductUnavailableError, VariantNotFoundError } from "../application/checkout.errors";

const mockGetProduct = getProduct as jest.Mock;
const mockFindVariant = prisma.productVariant.findUnique as jest.Mock;

const blusa = {
  slug: "blusa-lino",
  salePrice: 89000,
  variants: [{ colorId: 1, sizeId: 2, available: true, lowStock: false }],
};

beforeEach(() => jest.clearAllMocks());

describe("resolvePosLinePrices", () => {
  it("toma el precio del POS para los SKU del POS e ignora los ids de Neon", async () => {
    mockGetProduct.mockResolvedValue(blusa);
    const prices = await resolvePosLinePrices([
      { variantId: "pos-blusa-lino-1-2", name: "Blusa" },
      { variantId: "clxneonvariant01", name: "Set" },
    ]);
    expect(prices).toEqual(new Map([["pos-blusa-lino-1-2", 89000]]));
    expect(mockGetProduct).toHaveBeenCalledTimes(1);
  });

  it("rechaza un producto que el POS ya no publica o una variante inexistente", async () => {
    mockGetProduct.mockResolvedValueOnce(null);
    await expect(resolvePosLinePrices([{ variantId: "pos-blusa-lino-1-2", name: "Blusa" }])).rejects.toBeInstanceOf(
      ProductUnavailableError,
    );
    mockGetProduct.mockResolvedValueOnce(blusa);
    await expect(resolvePosLinePrices([{ variantId: "pos-blusa-lino-9-9", name: "Blusa" }])).rejects.toBeInstanceOf(
      VariantNotFoundError,
    );
  });

  it("si el POS no responde usa el precio del espejo en Neon por SKU", async () => {
    mockGetProduct.mockRejectedValue(new Error("timeout"));
    mockFindVariant.mockResolvedValue({ isActive: true, priceOverride: null, product: { basePrice: "85000" } });
    const prices = await resolvePosLinePrices([{ variantId: "pos-blusa-lino-1-2", name: "Blusa" }]);
    expect(prices.get("pos-blusa-lino-1-2")).toBe(85000);
    expect(mockFindVariant).toHaveBeenCalledWith(expect.objectContaining({ where: { sku: "pos-blusa-lino-1-2" } }));
  });
});
