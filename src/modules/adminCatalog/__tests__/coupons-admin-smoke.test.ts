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
  isValidCustomCouponCodeFormat,
  CODE_LENGTH,
  CHARSET,
} from "@/modules/adminCatalog/coupons/domain/coupon-code.entity";
import {
  createPromotionalCouponSchema,
  generateCouponsSchema,
  getCouponUsageSchema,
} from "@/modules/adminCatalog/coupons/contracts/coupon.schema";
import {
  mapCouponUsageToDetail,
  mapPromotionalCouponToListItem,
} from "@/modules/adminCatalog/coupons/presentation/mappers";
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

  it("isValidCustomCouponCodeFormat acepta códigos personalizados 4-20 chars", () => {
    expect(isValidCustomCouponCodeFormat("VERDE20")).toBe(true);
    expect(isValidCustomCouponCodeFormat("AB12")).toBe(true);
    expect(isValidCustomCouponCodeFormat("ABC")).toBe(false);
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

describe("Admin Coupons — createPromotionalCouponSchema", () => {
  it("acepta cupón con código aleatorio", () => {
    const result = createPromotionalCouponSchema.safeParse({
      codeSource: "RANDOM",
      discountType: "PERCENTAGE",
      discountValue: 20,
      maxGlobalUses: 50,
    });
    expect(result.success).toBe(true);
  });

  it("acepta cupón con nombre personalizado", () => {
    const result = createPromotionalCouponSchema.safeParse({
      codeSource: "CUSTOM",
      code: "VERDE20",
      discountType: "PERCENTAGE",
      discountValue: 20,
      maxGlobalUses: 50,
    });
    expect(result.success).toBe(true);
  });

  it("rechaza personalizado sin nombre", () => {
    const result = createPromotionalCouponSchema.safeParse({
      codeSource: "CUSTOM",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxGlobalUses: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rechaza aleatorio con código enviado", () => {
    const result = createPromotionalCouponSchema.safeParse({
      codeSource: "RANDOM",
      code: "VERDE20",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxGlobalUses: 10,
    });
    expect(result.success).toBe(false);
  });

  it("rechaza porcentaje mayor a 100", () => {
    const result = createPromotionalCouponSchema.safeParse({
      codeSource: "RANDOM",
      discountType: "PERCENTAGE",
      discountValue: 150,
      maxGlobalUses: 10,
    });
    expect(result.success).toBe(false);
  });

  it("acepta descuento fijo con nombre personalizado", () => {
    const result = createPromotionalCouponSchema.safeParse({
      codeSource: "CUSTOM",
      code: "AHORRA50K",
      discountType: "FIXED",
      discountValue: 50000,
      maxGlobalUses: 20,
    });
    expect(result.success).toBe(true);
  });

  it("acepta cupón sin vigencia (scheduleEnabled false por defecto)", () => {
    const result = createPromotionalCouponSchema.safeParse({
      codeSource: "RANDOM",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxGlobalUses: 10,
      scheduleEnabled: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.scheduleEnabled).toBe(false);
    }
  });

  it("rechaza día específico sin horas cuando vigencia está activa", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

    const result = createPromotionalCouponSchema.safeParse({
      codeSource: "RANDOM",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxGlobalUses: 10,
      scheduleEnabled: true,
      scheduleMode: "SINGLE_DAY",
      singleDayDate: dateStr,
    });
    expect(result.success).toBe(false);
  });

  it("acepta día específico con fecha y horas futuras", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

    const result = createPromotionalCouponSchema.safeParse({
      codeSource: "RANDOM",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxGlobalUses: 10,
      scheduleEnabled: true,
      scheduleMode: "SINGLE_DAY",
      singleDayDate: dateStr,
      startTime: "09:00",
      endTime: "18:00",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza rango con toDate anterior a fromDate", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const fromStr = dayAfter.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
    const toStr = tomorrow.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

    const result = createPromotionalCouponSchema.safeParse({
      codeSource: "RANDOM",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxGlobalUses: 10,
      scheduleEnabled: true,
      scheduleMode: "DATE_RANGE",
      fromDate: fromStr,
      toDate: toStr,
    });
    expect(result.success).toBe(false);
  });

  it("acepta rango de fechas válido", () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 5);
    const fromStr = tomorrow.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });
    const toStr = dayAfter.toLocaleDateString("en-CA", { timeZone: "America/Bogota" });

    const result = createPromotionalCouponSchema.safeParse({
      codeSource: "RANDOM",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxGlobalUses: 10,
      scheduleEnabled: true,
      scheduleMode: "DATE_RANGE",
      fromDate: fromStr,
      toDate: toStr,
    });
    expect(result.success).toBe(true);
  });
});

describe("Admin Coupons — promotional mapper", () => {
  it("mapPromotionalCouponToListItem incluye usos, estado y origen del código", () => {
    const result = mapPromotionalCouponToListItem({
      id: "c1",
      code: "VERDE20",
      codeSource: "CUSTOM",
      discountType: "PERCENTAGE",
      discountValue: 20,
      maxGlobalUses: 10,
      maxUsesPerUser: 1,
      currentGlobalUses: 3,
      isActive: true,
      scheduleMode: "NONE",
      validFrom: null,
      validTo: null,
      expiresAt: null,
      createdAt: new Date("2026-06-13T10:00:00Z"),
    });
    expect(result.code).toBe("VERDE20");
    expect(result.codeSource).toBe("CUSTOM");
    expect(result.currentGlobalUses).toBe(3);
    expect(result.maxGlobalUses).toBe(10);
    expect(result.status).toBe("ACTIVE");
    expect(result.scheduleLabel).toBe("Sin límite");
  });

  it("mapPromotionalCouponToListItem muestra vigencia de rango", () => {
    const result = mapPromotionalCouponToListItem({
      id: "c2",
      code: "RANGO10",
      codeSource: "RANDOM",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxGlobalUses: 5,
      maxUsesPerUser: 1,
      currentGlobalUses: 0,
      isActive: true,
      scheduleMode: "DATE_RANGE",
      validFrom: new Date("2026-06-10T05:00:00.000Z"),
      validTo: new Date("2026-06-21T04:59:59.999Z"),
      expiresAt: null,
      createdAt: new Date("2026-06-13T10:00:00Z"),
    });
    expect(result.scheduleMode).toBe("DATE_RANGE");
    expect(result.scheduleLabel).toContain("–");
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

