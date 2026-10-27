/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/lib/prisma", () => ({ prisma: {} }));
jest.mock("@/lib/product-keys", () => ({ findProductsByKeys: jest.fn() }));
jest.mock("@/modules/posIntegration/infrastructure/pos-catalog.client", () => ({
  isPosCatalogConfigured: jest.fn(() => true),
  validatePosPromotion: jest.fn(),
}));

import { findProductsByKeys } from "@/lib/product-keys";
import {
  isPosCatalogConfigured,
  validatePosPromotion,
} from "@/modules/posIntegration/infrastructure/pos-catalog.client";
import { POS_UNAVAILABLE_MESSAGE, quoteCouponWithPos } from "../infrastructure/pos-coupon";
import { couponRejection } from "../infrastructure/prisma-checkout.repository";
import {
  CouponAlreadyUsedError,
  CouponExpiredError,
  CouponInactiveError,
  CouponNotApplicableError,
} from "../application/checkout.errors";

jest.mock("@/modules/shipping/application/pos-shipping", () => ({}));
jest.mock("../infrastructure/pos-line-prices", () => ({}));

const mockValidate = validatePosPromotion as jest.Mock;
const mockFind = findProductsByKeys as jest.Mock;
const mockConfigured = isPosCatalogConfigured as jest.Mock;

const lines = [
  { variantId: "pos-vestido-lino-2-3", productId: "vestido-lino", price: 120000, quantity: 1 },
  { variantId: "clxneonvariant01", productId: "clxneonproduct01", price: 30000, quantity: 2 },
];

function posResult(overrides: Record<string, unknown> = {}) {
  return {
    valid: true,
    promotionId: "PRM-2026-0042",
    code: "VERANO25",
    kind: "PROMOTIONAL",
    name: "Verano",
    discountType: "PERCENTAGE",
    discountValue: 25,
    minPurchase: null,
    scopeType: "ORDER",
    eligibleBase: 180000,
    discountAmount: 45000,
    lineDiscounts: [
      { index: 0, productSlug: "vestido-lino", discount: 30000 },
      { index: 1, productSlug: "set-neon", discount: 15000 },
    ],
    reason: null,
    message: null,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockConfigured.mockReturnValue(true);
  mockFind.mockResolvedValue(new Map([["clxneonproduct01", { id: "clxneonproduct01", slug: "set", posSlug: "set-neon" }]]));
});

describe("quoteCouponWithPos", () => {
  it("envía al POS el código normalizado, el comprador y las líneas con su slug", async () => {
    mockValidate.mockResolvedValue(posResult());

    const quote = await quoteCouponWithPos({ code: " verano25 ", email: "Cliente@Correo.co", document: " 1098 ", lines });

    expect(mockValidate).toHaveBeenCalledWith({
      code: "VERANO25",
      customerEmail: "cliente@correo.co",
      customerDocument: "1098",
      lines: [
        { index: 0, productSlug: "vestido-lino", colorId: 2, sizeId: 3, quantity: 1, unitPrice: 120000 },
        { index: 1, productSlug: "set-neon", colorId: null, sizeId: null, quantity: 2, unitPrice: 30000 },
      ],
    });
    expect(quote).toEqual(
      expect.objectContaining({
        valid: true,
        promotionId: "PRM-2026-0042",
        code: "VERANO25",
        discountAmount: 45000,
        lineDiscounts: [30000, 15000],
        wholeOrder: true,
        eligibleVariantIds: null,
      }),
    );
  });

  it("con alcance devuelve las variantes elegibles (las que tienen descuento)", async () => {
    mockValidate.mockResolvedValue(
      posResult({
        scopeType: "PRODUCTS",
        discountAmount: 30000,
        lineDiscounts: [{ index: 0, productSlug: "vestido-lino", discount: 30000 }],
      }),
    );
    const quote = await quoteCouponWithPos({ code: "VERANO25", lines });
    expect(quote.valid && quote.eligibleVariantIds).toEqual(["pos-vestido-lino-2-3"]);
    expect(quote.valid && quote.lineDiscounts).toEqual([30000, 0]);
  });

  it("devuelve el motivo y el mensaje del POS cuando el cupón no aplica", async () => {
    mockValidate.mockResolvedValue({
      ...posResult(),
      valid: false,
      promotionId: null,
      reason: "COUPON_ALREADY_USED",
      message: "Este cupón ya fue utilizado por este cliente",
    });
    await expect(quoteCouponWithPos({ code: "VERANO25", lines })).resolves.toEqual({
      valid: false,
      reason: "COUPON_ALREADY_USED",
      message: "Este cupón ya fue utilizado por este cliente",
    });
  });

  it("sin POS (caído o sin configurar) no acepta el cupón", async () => {
    mockValidate.mockRejectedValue(new Error("timeout"));
    await expect(quoteCouponWithPos({ code: "VERANO25", lines })).resolves.toEqual({
      valid: false,
      reason: "POS_UNAVAILABLE",
      message: POS_UNAVAILABLE_MESSAGE,
    });

    mockConfigured.mockReturnValue(false);
    const quote = await quoteCouponWithPos({ code: "VERANO25", lines });
    expect(quote.valid).toBe(false);
    expect(mockValidate).toHaveBeenCalledTimes(1);
  });

  it("no consulta al POS sin código", async () => {
    await expect(quoteCouponWithPos({ code: "  ", lines })).resolves.toEqual(
      expect.objectContaining({ valid: false, reason: "CODE_REQUIRED" }),
    );
    expect(mockValidate).not.toHaveBeenCalled();
  });
});

describe("couponRejection", () => {
  it("traduce el motivo del POS al error del checkout con su mensaje", () => {
    expect(couponRejection("COUPON_ALREADY_USED", "ya usado")).toBeInstanceOf(CouponAlreadyUsedError);
    expect(couponRejection("COUPON_EXPIRED", "vencido")).toBeInstanceOf(CouponExpiredError);
    expect(couponRejection("CHANNEL_NOT_ALLOWED", "solo tienda")).toBeInstanceOf(CouponInactiveError);
    const other = couponRejection("MIN_PURCHASE_NOT_MET", "Compra mínima de $100.000 para usar este cupón");
    expect(other).toBeInstanceOf(CouponNotApplicableError);
    expect(other.message).toBe("Compra mínima de $100.000 para usar este cupón");
  });
});
