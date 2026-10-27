/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("../infrastructure/pos-catalog.client", () => ({
  isPosCatalogConfigured: jest.fn(() => true),
  reservePosStock: jest.fn(),
  releasePosStock: jest.fn(),
}));

import { isPosCatalogConfigured, releasePosStock, reservePosStock } from "../infrastructure/pos-catalog.client";
import {
  PosReservationUnavailableError,
  releasePosReservation,
  reservePosStockForOrder,
} from "../application/reserve-pos-stock.use-case";

const mockReserve = reservePosStock as jest.Mock;
const mockRelease = releasePosStock as jest.Mock;
const mockConfigured = isPosCatalogConfigured as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockConfigured.mockReturnValue(true);
});

describe("reservePosStockForOrder", () => {
  it("agrupa las líneas por prenda y reserva con el número del pedido", async () => {
    mockReserve.mockResolvedValue({ reserved: true, expiresAt: "2026-10-27T10:30:00Z", problems: [] });

    const issues = await reservePosStockForOrder(
      "CV-1",
      [
        { variantId: "pos-blusa-lino-1-2", quantity: 1 },
        { variantId: "pos-blusa-lino-1-2", quantity: 2 },
        { variantId: "pos-falda-3-4", quantity: 1 },
      ],
      30,
    );

    expect(issues).toEqual([]);
    expect(mockReserve).toHaveBeenCalledWith(
      "CV-1",
      [
        { productSlug: "blusa-lino", colorId: 1, sizeId: 2, quantity: 3, unitPrice: 0 },
        { productSlug: "falda", colorId: 3, sizeId: 4, quantity: 1, unitPrice: 0 },
      ],
      30,
    );
  });

  it("devuelve lo que no alcanza con el mensaje del POS", async () => {
    mockReserve.mockResolvedValue({
      reserved: false,
      expiresAt: null,
      problems: [
        { productSlug: "BLUSA-LINO", colorId: 1, sizeId: 2, requested: 3, available: 1, message: "Blusa: solo quedan 1 unidad" },
        { productSlug: "falda", colorId: 3, sizeId: 4, requested: 1, available: 0, message: "El producto ya no existe" },
      ],
    });

    const issues = await reservePosStockForOrder(
      "CV-2",
      [
        { variantId: "pos-blusa-lino-1-2", quantity: 3 },
        { variantId: "pos-falda-3-4", quantity: 1 },
      ],
      30,
    );

    expect(issues).toEqual([
      { variantId: "pos-blusa-lino-1-2", reason: "out_of_stock", message: "Blusa: solo quedan 1 unidad" },
      { variantId: "pos-falda-3-4", reason: "product_unavailable", message: "El producto ya no existe" },
    ]);
  });

  it("rechaza una línea sin SKU del POS sin llamar al POS", async () => {
    const issues = await reservePosStockForOrder("CV-3", [{ variantId: "clxneonvariant01", quantity: 1 }], 30);
    expect(issues).toEqual([{ variantId: "clxneonvariant01", reason: "product_unavailable" }]);
    expect(mockReserve).not.toHaveBeenCalled();
  });

  it("si el POS no responde el pedido no se crea", async () => {
    mockReserve.mockRejectedValue(new Error("timeout"));
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(
      reservePosStockForOrder("CV-4", [{ variantId: "pos-blusa-lino-1-2", quantity: 1 }], 30),
    ).rejects.toBeInstanceOf(PosReservationUnavailableError);
  });
});

describe("releasePosReservation", () => {
  it("suelta la reserva y no lanza si el POS no responde (vence sola)", async () => {
    mockRelease.mockResolvedValueOnce(1).mockRejectedValueOnce(new Error("timeout"));
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
    await releasePosReservation("CV-5");
    await expect(releasePosReservation("CV-6")).resolves.toBeUndefined();
    expect(mockRelease).toHaveBeenCalledWith("CV-5");
  });
});
