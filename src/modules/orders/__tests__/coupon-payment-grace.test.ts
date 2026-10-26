/** @jest-environment node */

import { readFileSync } from "fs";
import { join } from "path";
import {
  computeOrderPaymentExpiresAt,
  isOrderWithinPaymentGrace,
  ORDER_PAYMENT_GRACE_MS,
} from "@/modules/checkout/domain/order-payment-grace";
import { OrderPaymentGraceExpiredError } from "@/modules/orders/application/order.errors";


describe("order payment grace — Flash Sale snapshot", () => {
  it("computeOrderPaymentExpiresAt suma 30 minutos", () => {
    const from = new Date("2026-06-15T12:00:00.000Z");
    const expires = computeOrderPaymentExpiresAt(from);
    expect(expires.getTime() - from.getTime()).toBe(ORDER_PAYMENT_GRACE_MS);
  });

  it("isOrderWithinPaymentGrace true dentro de la ventana", () => {
    const now = new Date("2026-06-15T12:00:00.000Z");
    const paymentExpiresAt = new Date("2026-06-15T12:30:00.000Z");
    expect(isOrderWithinPaymentGrace(paymentExpiresAt, now)).toBe(true);
  });

  it("isOrderWithinPaymentGrace false fuera de la ventana", () => {
    const now = new Date("2026-06-15T12:31:00.000Z");
    const paymentExpiresAt = new Date("2026-06-15T12:30:00.000Z");
    expect(isOrderWithinPaymentGrace(paymentExpiresAt, now)).toBe(false);
  });

  it("isOrderWithinPaymentGrace permite órdenes legacy sin paymentExpiresAt", () => {
    expect(isOrderWithinPaymentGrace(null)).toBe(true);
    expect(isOrderWithinPaymentGrace(undefined)).toBe(true);
  });

});

describe("markPaid — sin cupones locales", () => {
  const repoPath = join(
    process.cwd(),
    "src/modules/orders/infrastructure/prisma-order.repository.ts"
  );
  const source = readFileSync(repoPath, "utf8");


  it("markPaid no consulta ni consolida cupones en Neon (el uso lo registra el POS)", () => {
    expect(source).not.toMatch(/\.coupon\.|couponUsage|"coupons"/);
  });

  it("markPaid valida paymentExpiresAt con isOrderWithinPaymentGrace", () => {
    expect(source).toContain("isOrderWithinPaymentGrace");
    expect(source).toContain("OrderPaymentGraceExpiredError");
  });
});

describe("OrderPaymentGraceExpiredError", () => {
  it("tiene mensaje claro en español", () => {
    const err = new OrderPaymentGraceExpiredError();
    expect(err.message).toContain("tiempo");
    expect(err.name).toBe("OrderPaymentGraceExpiredError");
  });
});
