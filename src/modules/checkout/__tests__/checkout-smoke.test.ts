/** @jest-environment node */

// Smoke tests del módulo checkout — cubren lógica pura (domain, schema Zod,
// calculators de UI). NO ejecuta llamadas a DB ni HTTP. Para un test
// end-to-end con la transacción Prisma completa (stock atómico, cupón,
// early bird) usar el checklist de QA manual del plan.

import {
  calculateEarlyBirdDiscount,
  isUserEligibleForEarlyBird,
} from "@/modules/checkout/domain/early-bird.entity";
import {
  calculateCouponDiscount,
  isCouponEligibleForEmail,
} from "@/modules/checkout/domain/coupon.entity";
import { createOrderInputSchema } from "@/modules/checkout/contracts/create-order.schema";
import {
  calcLineItemDisplayTotals,
  calcCheckoutTotals,
} from "@/modules/checkout/presentation/calculators/line-item-totals";

describe("Checkout — early-bird domain", () => {
  it("isUserEligibleForEarlyBird detecta el flag estrictamente", () => {
    expect(isUserEligibleForEarlyBird({ earlyBirdDiscount: true })).toBe(true);
    expect(isUserEligibleForEarlyBird({ earlyBirdDiscount: false })).toBe(false);
    expect(isUserEligibleForEarlyBird({ earlyBirdDiscount: null })).toBe(false);
    expect(isUserEligibleForEarlyBird({ earlyBirdDiscount: undefined })).toBe(false);
  });

  it("calculateEarlyBirdDiscount devuelve 10% redondeado o 0 si no elegible", () => {
    expect(calculateEarlyBirdDiscount(100000, true)).toBe(10000);
    expect(calculateEarlyBirdDiscount(100000, false)).toBe(0);
    // Redondeo: 12345 * 10 / 100 = 1234.5 → 1235
    expect(calculateEarlyBirdDiscount(12345, true)).toBe(1235);
    expect(calculateEarlyBirdDiscount(0, true)).toBe(0);
  });
});

describe("Checkout — coupon domain", () => {
  const validCoupon = { isUsed: false, assignedEmail: "Test@Example.com" };

  it("isCouponEligibleForEmail acepta email case-insensitive", () => {
    expect(isCouponEligibleForEmail(validCoupon, "test@example.com")).toBe(true);
    expect(isCouponEligibleForEmail(validCoupon, "TEST@example.com")).toBe(true);
  });

  it("isCouponEligibleForEmail rechaza si está usado", () => {
    const used = { isUsed: true, assignedEmail: "test@example.com" };
    expect(isCouponEligibleForEmail(used, "test@example.com")).toBe(false);
  });

  it("isCouponEligibleForEmail rechaza si el email no coincide", () => {
    expect(isCouponEligibleForEmail(validCoupon, "other@example.com")).toBe(false);
  });

  it("isCouponEligibleForEmail rechaza coupons null/undefined", () => {
    expect(isCouponEligibleForEmail(null, "test@example.com")).toBe(false);
    expect(isCouponEligibleForEmail(undefined, "test@example.com")).toBe(false);
  });

  it("calculateCouponDiscount aplica porcentaje y redondea", () => {
    expect(calculateCouponDiscount(100000, 15)).toBe(15000);
    expect(calculateCouponDiscount(33333, 10)).toBe(3333);
    // Redondeo: 12345 * 15 / 100 = 1851.75 → 1852
    expect(calculateCouponDiscount(12345, 15)).toBe(1852);
    expect(calculateCouponDiscount(100000, 0)).toBe(0);
  });
});

describe("Checkout — createOrderInputSchema (Zod)", () => {
  const validInput = {
    email: "test@example.com",
    firstName: "Juan",
    lastName: "Pérez",
    cedula: "1234567890",
    phone: "3001234567",
    address: "Calle 123 # 45-67",
    city: "Bogotá",
    department: "Cundinamarca",
    paymentMethod: "BOLD" as const,
    items: [
      {
        variantId: "v1",
        productId: "p1",
        name: "Producto",
        sku: "SKU-1",
        colorName: "Verde",
        size: "M",
        price: 50000,
        quantity: 2,
      },
    ],
    subtotal: 100000,
    shippingCost: 18000,
    discount: 0,
  };

  it("acepta input válido", () => {
    const result = createOrderInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rechaza email inválido", () => {
    const result = createOrderInputSchema.safeParse({ ...validInput, email: "no-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Correo electrónico inválido/);
    }
  });

  it("rechaza cédula con menos de 6 dígitos", () => {
    const result = createOrderInputSchema.safeParse({ ...validInput, cedula: "12345" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Cédula inválida/);
    }
  });

  it("rechaza cédula con más de 12 dígitos", () => {
    const result = createOrderInputSchema.safeParse({ ...validInput, cedula: "1234567890123" });
    expect(result.success).toBe(false);
  });

  it("rechaza teléfono que no tenga 10 dígitos", () => {
    const result = createOrderInputSchema.safeParse({ ...validInput, phone: "300123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/Teléfono inválido/);
    }
  });

  it("rechaza items vacío", () => {
    const result = createOrderInputSchema.safeParse({ ...validInput, items: [] });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/El carrito está vacío/);
    }
  });

  it("rechaza item con price <= 0", () => {
    const result = createOrderInputSchema.safeParse({
      ...validInput,
      items: [{ ...validInput.items[0], price: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it("rechaza item con quantity > 100", () => {
    const result = createOrderInputSchema.safeParse({
      ...validInput,
      items: [{ ...validInput.items[0], quantity: 101 }],
    });
    expect(result.success).toBe(false);
  });

  it("rechaza firstName demasiado largo (>50)", () => {
    const result = createOrderInputSchema.safeParse({
      ...validInput,
      firstName: "x".repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it("rechaza address demasiado larga (>200)", () => {
    const result = createOrderInputSchema.safeParse({
      ...validInput,
      address: "x".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("rechaza paymentMethod fuera del enum", () => {
    const result = createOrderInputSchema.safeParse({
      ...validInput,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      paymentMethod: "PSE" as any,
    });
    expect(result.success).toBe(false);
  });
});

describe("Checkout — line-item totals calculator", () => {
  it("calcLineItemDisplayTotals sin earlyBird devuelve original=descontado", () => {
    const r = calcLineItemDisplayTotals({ price: 50000, quantity: 2 }, false);
    expect(r.originalTotal).toBe(100000);
    expect(r.discountedTotal).toBe(100000);
    expect(r.showsDiscount).toBe(false);
  });

  it("calcLineItemDisplayTotals con earlyBird aplica 10% redondeado", () => {
    const r = calcLineItemDisplayTotals({ price: 50000, quantity: 2 }, true);
    expect(r.originalTotal).toBe(100000);
    expect(r.discountedTotal).toBe(90000);
    expect(r.showsDiscount).toBe(true);
  });

  it("calcLineItemDisplayTotals redondea descuento (1234.5 → 1235)", () => {
    const r = calcLineItemDisplayTotals({ price: 12345, quantity: 1 }, true);
    expect(r.originalTotal).toBe(12345);
    // 12345 * 0.9 = 11110.5 → Math.round → 11111
    expect(r.discountedTotal).toBe(11111);
  });
});

describe("Checkout — checkout totals calculator", () => {
  const items = [
    { price: 50000, quantity: 2 }, // 100k
    { price: 25000, quantity: 1 }, //  25k
  ];

  it("calcCheckoutTotals sin descuentos: subtotal + shipping", () => {
    const r = calcCheckoutTotals({
      items,
      shippingCost: 18000,
      couponDiscount: 0,
      earlyBirdActive: false,
    });
    expect(r.subtotal).toBe(125000);
    expect(r.earlyBirdDiscount).toBe(0);
    expect(r.couponDiscount).toBe(0);
    expect(r.discount).toBe(0);
    expect(r.total).toBe(143000);
  });

  it("calcCheckoutTotals con earlyBird aplica 10% al subtotal", () => {
    const r = calcCheckoutTotals({
      items,
      shippingCost: 18000,
      couponDiscount: 0,
      earlyBirdActive: true,
    });
    expect(r.subtotal).toBe(125000);
    expect(r.earlyBirdDiscount).toBe(12500);
    expect(r.discount).toBe(12500);
    expect(r.total).toBe(125000 + 18000 - 12500);
  });

  it("calcCheckoutTotals combina cupón + earlyBird", () => {
    const r = calcCheckoutTotals({
      items,
      shippingCost: 18000,
      couponDiscount: 20000,
      earlyBirdActive: true,
    });
    expect(r.couponDiscount).toBe(20000);
    expect(r.earlyBirdDiscount).toBe(12500);
    expect(r.discount).toBe(32500);
    expect(r.total).toBe(125000 + 18000 - 32500);
  });
});
