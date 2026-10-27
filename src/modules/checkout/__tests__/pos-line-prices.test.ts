/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/modules/posIntegration/infrastructure/pos-catalog.client", () => ({ getProduct: jest.fn() }));

import { getProduct } from "@/modules/posIntegration/infrastructure/pos-catalog.client";
import { resolvePosLinePrices } from "../infrastructure/pos-line-prices";
import { PosUnavailableError, ProductUnavailableError, VariantNotFoundError } from "../application/checkout.errors";

const mockGetProduct = getProduct as jest.Mock;

const blusa = {
  slug: "blusa-lino",
  salePrice: 89000,
  variants: [{ colorId: 1, sizeId: 2, available: true, lowStock: false }],
};

beforeEach(() => jest.clearAllMocks());

describe("resolvePosLinePrices", () => {
  it("toma el precio del POS una vez por producto", async () => {
    mockGetProduct.mockResolvedValue(blusa);
    const prices = await resolvePosLinePrices([
      { variantId: "pos-blusa-lino-1-2", name: "Blusa" },
      { variantId: "pos-blusa-lino-1-2", name: "Blusa" },
    ]);
    expect(prices).toEqual(new Map([["pos-blusa-lino-1-2", 89000]]));
    expect(mockGetProduct).toHaveBeenCalledTimes(1);
  });

  it("rechaza un ítem sin SKU del POS (carrito anterior a la migración)", async () => {
    await expect(resolvePosLinePrices([{ variantId: "clxneonvariant01", name: "Set" }])).rejects.toBeInstanceOf(
      ProductUnavailableError,
    );
    expect(mockGetProduct).not.toHaveBeenCalled();
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

  it("si el POS no responde el pedido no se crea", async () => {
    mockGetProduct.mockRejectedValue(new Error("timeout"));
    await expect(resolvePosLinePrices([{ variantId: "pos-blusa-lino-1-2", name: "Blusa" }])).rejects.toBeInstanceOf(
      PosUnavailableError,
    );
  });
});
