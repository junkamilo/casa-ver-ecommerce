/** @jest-environment node */

const mockGetCouponUsageDetail = jest.fn();

jest.mock("@/modules/adminCatalog/coupons/infrastructure/prisma-coupon-admin.repository", () => ({
  PrismaCouponAdminRepository: jest.fn().mockImplementation(() => ({
    getCouponUsageDetail: (...args: unknown[]) => mockGetCouponUsageDetail(...args),
  })),
}));

import {
  generateCouponCode,
  isValidCouponCodeFormat,
  CODE_LENGTH,
  CHARSET,
} from "@/modules/adminCatalog/coupons/domain/coupon-code.entity";
import { generateCouponsSchema, getCouponUsageSchema } from "@/modules/adminCatalog/coupons/contracts/coupon.schema";
import { mapCouponUsageToDetail } from "@/modules/adminCatalog/coupons/presentation/mappers";
import { getCouponUsageUseCase } from "@/modules/adminCatalog/coupons/application/get-coupon-usage.use-case";
import { CouponValidationError, CouponNotFoundError } from "@/modules/adminCatalog/coupons/application/coupon.errors";

describe("Admin Coupons — code generator", () => {
  it("genera códigos de exactamente 12 caracteres", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateCouponCode();
      expect(code).toHaveLength(CODE_LENGTH);
      expect(isValidCouponCodeFormat(code)).toBe(true);
    }
  });

  it("solo usa caracteres A-Z y 0-9", () => {
    for (let i = 0; i < 50; i++) {
      const code = generateCouponCode();
      for (const char of code) {
        expect(CHARSET).toContain(char);
      }
    }
  });

  it("genera códigos distintos en sucesión (probabilístico)", () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateCouponCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe("Admin Coupons — generateCouponsSchema", () => {
  it("acepta quantity entre 1 y 100", () => {
    expect(generateCouponsSchema.safeParse({ discountPercentage: 20, quantity: 1 }).success).toBe(true);
    expect(generateCouponsSchema.safeParse({ discountPercentage: 20, quantity: 100 }).success).toBe(true);
  });

  it("rechaza quantity fuera de rango", () => {
    expect(generateCouponsSchema.safeParse({ discountPercentage: 20, quantity: 0 }).success).toBe(false);
    expect(generateCouponsSchema.safeParse({ discountPercentage: 20, quantity: 101 }).success).toBe(false);
  });

  it("rechaza porcentaje fuera de rango", () => {
    expect(generateCouponsSchema.safeParse({ discountPercentage: 0, quantity: 10 }).success).toBe(false);
    expect(generateCouponsSchema.safeParse({ discountPercentage: 101, quantity: 10 }).success).toBe(false);
  });
});

describe("Admin Coupons — usage mapper", () => {
  const mockOrder = {
    orderNumber: "ORD-TEST-001",
    status: "PAID",
    paymentMethod: "BOLD",
    subtotal: 100000,
    shippingCost: 18000,
    discount: 10000,
    total: 108000,
    createdAt: new Date("2026-06-12T12:00:00Z"),
    shippingName: "Juan Pérez",
    shippingPhone: "3001234567",
    shippingCedula: "1234567890",
    shippingAddress: "Calle 1 # 2-3",
    shippingCity: "Bogotá",
    shippingDepartment: "Cundinamarca",
    user: { email: "juan@example.com", name: "Juan Pérez" },
  };

  const mockCoupon = {
    id: "coupon-1",
    code: "ABCDEF123456",
    discountPercentage: 10,
    usedAt: new Date("2026-06-12T13:00:00Z"),
  };

  it("mapCouponUsageToDetail mapea comprador y orden", () => {
    const result = mapCouponUsageToDetail(mockCoupon, mockOrder);
    expect(result.coupon.code).toBe("ABCDEF123456");
    expect(result.customer.email).toBe("juan@example.com");
    expect(result.customer.name).toBe("Juan Pérez");
    expect(result.order.orderNumber).toBe("ORD-TEST-001");
    expect(result.order.status).toBe("Pagado");
    expect(result.order.paymentMethod).toBe("Bold");
    expect(result.order.discount).toBe(10000);
    expect(result.order.total).toBe(108000);
  });
});

describe("Admin Coupons — getCouponUsageUseCase", () => {
  beforeEach(() => {
    mockGetCouponUsageDetail.mockReset();
  });

  it("getCouponUsageSchema rechaza id vacío", () => {
    expect(getCouponUsageSchema.safeParse({ id: "" }).success).toBe(false);
  });

  it("rechaza cupón no usado", async () => {
    mockGetCouponUsageDetail.mockResolvedValue({
      coupon: {
        id: "c1",
        code: "CODE12345678",
        discountPercentage: 10,
        isUsed: false,
        usedAt: null,
        usedByOrderId: null,
      },
      order: null,
    });

    await expect(getCouponUsageUseCase({ id: "c1" })).rejects.toThrow(CouponValidationError);
  });

  it("rechaza cupón inexistente", async () => {
    mockGetCouponUsageDetail.mockResolvedValue(null);

    await expect(getCouponUsageUseCase({ id: "missing" })).rejects.toThrow(CouponNotFoundError);
  });
});
