/** @jest-environment node */

import { readFileSync } from "fs";
import { join } from "path";
import { bogotaInstant } from "@/modules/checkout/domain/coupon-schedule";
import {
  computeOrderPaymentExpiresAt,
  isOrderWithinPaymentGrace,
  ORDER_PAYMENT_GRACE_MS,
} from "@/modules/checkout/domain/order-payment-grace";
import { validateCouponTimeWindow } from "@/modules/checkout/domain/validate-coupon-time-window";
import {
  CouponExpiredError,
  CouponNotYetValidError,
} from "@/modules/checkout/application/checkout.errors";
import { OrderPaymentGraceExpiredError } from "@/modules/orders/application/order.errors";

describe("validateCouponTimeWindow — orquestador temporal", () => {
  const window = {
    scheduleMode: "SINGLE_DAY" as const,
    validFrom: bogotaInstant("2026-06-15", "09:00"),
    validTo: bogotaInstant("2026-06-15", "18:00"),
    expiresAt: null,
  };

  it("no lanza cuando la ventana es válida", () => {
    expect(() =>
      validateCouponTimeWindow(window, bogotaInstant("2026-06-15", "12:00"))
    ).not.toThrow();
  });

  it("lanza CouponNotYetValidError antes de validFrom", () => {
    expect(() =>
      validateCouponTimeWindow(window, bogotaInstant("2026-06-15", "08:00"))
    ).toThrow(CouponNotYetValidError);
  });

  it("lanza CouponExpiredError después de validTo", () => {
    expect(() =>
      validateCouponTimeWindow(window, bogotaInstant("2026-06-15", "19:00"))
    ).toThrow(CouponExpiredError);
  });

  it("acepta cupón sin ventana (scheduleMode NONE)", () => {
    expect(() =>
      validateCouponTimeWindow({
        scheduleMode: "NONE",
        validFrom: null,
        validTo: null,
        expiresAt: null,
      })
    ).not.toThrow();
  });
});

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

  it("cupón expirado en ventana pero orden en grace: validateCouponTimeWindow fallaría en Fase 1, no en webhook", () => {
    const expiredCoupon = {
      scheduleMode: "SINGLE_DAY" as const,
      validFrom: bogotaInstant("2026-06-15", "09:00"),
      validTo: bogotaInstant("2026-06-15", "10:00"),
      expiresAt: null,
    };
    const orderCreatedAt = bogotaInstant("2026-06-15", "09:45");
    const afterCouponEnd = bogotaInstant("2026-06-15", "10:10");
    expect(() => validateCouponTimeWindow(expiredCoupon, afterCouponEnd)).toThrow(
      CouponExpiredError
    );

    const paymentExpiresAt = computeOrderPaymentExpiresAt(orderCreatedAt);
    expect(isOrderWithinPaymentGrace(paymentExpiresAt, afterCouponEnd)).toBe(true);
  });
});

describe("markPaid — sin revalidación temporal del cupón", () => {
  const repoPath = join(
    process.cwd(),
    "src/modules/orders/infrastructure/prisma-order.repository.ts"
  );
  const source = readFileSync(repoPath, "utf8");

  it("consolidatePromotionalCouponUsage no importa validateCouponTimeWindow", () => {
    expect(source).not.toContain("validateCouponTimeWindow");
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
