/** @jest-environment node */

// Smoke tests del módulo checkout — cubren lógica pura (domain, schema Zod,
// calculators de UI). NO ejecuta llamadas a DB ni HTTP.

import {
  calculateCouponDiscount,
  calculateCouponDiscountAmount,
  isCouponEligibleForEmail,
} from "@/modules/checkout/domain/coupon.entity";
import { createOrderInputSchema } from "@/modules/checkout/contracts/create-order.schema";
import {
  calcLineItemDisplayTotals,
  calcCheckoutTotals,
} from "@/modules/checkout/presentation/calculators/line-item-totals";

describe("Checkout — coupon domain", () => {
  const legacyCoupon = { isUsed: false, assignedEmail: "Test@Example.com" };
  const openCoupon = { isUsed: false, assignedEmail: null };

  it("isCouponEligibleForEmail acepta email case-insensitive (legacy)", () => {
    expect(isCouponEligibleForEmail(legacyCoupon, "test@example.com")).toBe(true);
    expect(isCouponEligibleForEmail(legacyCoupon, "TEST@example.com")).toBe(true);
  });

  it("isCouponEligibleForEmail rechaza si está usado", () => {
    const used = { isUsed: true, assignedEmail: "test@example.com" };
    expect(isCouponEligibleForEmail(used, "test@example.com")).toBe(false);
  });

  it("isCouponEligibleForEmail rechaza legacy si el email no coincide", () => {
    expect(isCouponEligibleForEmail(legacyCoupon, "other@example.com")).toBe(false);
  });

  it("isCouponEligibleForEmail acepta cupón abierto si no está usado", () => {
    expect(isCouponEligibleForEmail(openCoupon, "any@example.com")).toBe(true);
  });

  it("isCouponEligibleForEmail rechaza cupón abierto usado", () => {
    expect(isCouponEligibleForEmail({ isUsed: true, assignedEmail: null }, "any@example.com")).toBe(false);
  });

  it("isCouponEligibleForEmail rechaza coupons null/undefined", () => {
    expect(isCouponEligibleForEmail(null, "test@example.com")).toBe(false);
    expect(isCouponEligibleForEmail(undefined, "test@example.com")).toBe(false);
  });

  it("calculateCouponDiscount aplica porcentaje y redondea", () => {
    expect(calculateCouponDiscount(100000, 15)).toBe(15000);
    expect(calculateCouponDiscount(33333, 10)).toBe(3333);
    expect(calculateCouponDiscount(12345, 15)).toBe(1852);
    expect(calculateCouponDiscount(100000, 0)).toBe(0);
  });

  it("calculateCouponDiscountAmount soporta monto fijo", () => {
    expect(calculateCouponDiscountAmount(80000, "FIXED", 25000)).toBe(25000);
    expect(calculateCouponDiscountAmount(10000, "FIXED", 25000)).toBe(10000);
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
  it("calcLineItemDisplayTotals devuelve original=descontado sin cupón", () => {
    const r = calcLineItemDisplayTotals({ price: 50000, quantity: 2 });
    expect(r.originalTotal).toBe(100000);
    expect(r.discountedTotal).toBe(100000);
    expect(r.showsDiscount).toBe(false);
  });

  it("calcLineItemDisplayTotals prorratea descuento por ítem", () => {
    const r = calcLineItemDisplayTotals({ price: 1000, quantity: 1 }, 10);
    expect(r.originalTotal).toBe(1000);
    expect(r.discountedTotal).toBe(900);
    expect(r.showsDiscount).toBe(true);
  });
});

describe("Checkout — checkout totals calculator", () => {
  const items = [
    { price: 50000, quantity: 2 },
    { price: 25000, quantity: 1 },
  ];

  it("calcCheckoutTotals sin descuentos: subtotal + shipping", () => {
    const r = calcCheckoutTotals({
      items,
      shippingCost: 18000,
      couponDiscount: 0,
    });
    expect(r.subtotal).toBe(125000);
    expect(r.couponDiscount).toBe(0);
    expect(r.discount).toBe(0);
    expect(r.total).toBe(143000);
  });

  it("calcCheckoutTotals con cupón aplica descuento al total", () => {
    const r = calcCheckoutTotals({
      items,
      shippingCost: 18000,
      couponDiscount: 20000,
    });
    expect(r.couponDiscount).toBe(20000);
    expect(r.discount).toBe(20000);
    expect(r.total).toBe(125000 + 18000 - 20000);
  });
});
