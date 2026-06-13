/** @jest-environment node */

import {
  hasUserExceededCouponLimit,
  isPromotionalCoupon,
} from "@/modules/checkout/domain/coupon.entity";

describe("Orders — promotional coupon consolidation logic", () => {
  it("solo consolida cupones PROMOTIONAL", () => {
    expect(isPromotionalCoupon("PROMOTIONAL")).toBe(true);
    expect(isPromotionalCoupon("BATCH_SINGLE")).toBe(false);
  });

  it("bloquea consolidación si el usuario ya agotó su único uso", () => {
    expect(hasUserExceededCouponLimit(1, 1)).toBe(true);
    expect(hasUserExceededCouponLimit(0, 1)).toBe(false);
  });
});
