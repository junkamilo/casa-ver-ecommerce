/** @jest-environment node */



import {

  calculateCouponDiscountAmount,

  formatCouponDiscountLabel,

  getCouponScheduleStatus,

  getPromotionalCouponStatus,

  hasUserExceededCouponLimit,

  isCouponEligibleForEmail,

  isCouponExpired,

  isCouponGloballyAvailable,

  isCouponWithinSchedule,

  isPromotionalCoupon,

  PROMOTIONAL_MAX_USES_PER_USER,

} from "@/modules/checkout/domain/coupon.entity";

import {

  bogotaDayEnd,

  bogotaDayStart,

  bogotaInstant,

  buildCouponSchedule,

  formatCouponScheduleLabel,

} from "@/modules/checkout/domain/coupon-schedule";

import { validateCouponTimeWindow } from "@/modules/checkout/domain/validate-coupon-time-window";

import {

  CouponExpiredError,

  CouponNotYetValidError,

} from "@/modules/checkout/application/checkout.errors";



describe("Coupon domain — promotional predicates", () => {

  const activePromo = {

    kind: "PROMOTIONAL" as const,

    isUsed: false,

    assignedEmail: null,

    isActive: true,

    scheduleMode: "NONE" as const,

    validFrom: null,

    validTo: null,

    expiresAt: null,

    maxGlobalUses: 10,

    currentGlobalUses: 3,

    maxUsesPerUser: 1,

  };



  it("isPromotionalCoupon discrimina tipo", () => {

    expect(isPromotionalCoupon("PROMOTIONAL")).toBe(true);

    expect(isPromotionalCoupon("BATCH_SINGLE")).toBe(false);

  });



  it("isCouponGloballyAvailable valida cupo global", () => {

    expect(isCouponGloballyAvailable(activePromo)).toBe(true);

    expect(

      isCouponGloballyAvailable({ ...activePromo, currentGlobalUses: 10 })

    ).toBe(false);

    expect(isCouponGloballyAvailable({ ...activePromo, isActive: false })).toBe(false);

  });



  it("isCouponExpired detecta expiración legacy", () => {

    const past = new Date("2020-01-01");

    expect(isCouponExpired(past)).toBe(true);

    expect(isCouponExpired(null)).toBe(false);

    expect(isCouponExpired(new Date("2099-01-01"))).toBe(false);

  });



  it("isCouponEligibleForEmail acepta promocional sin email asignado", () => {

    expect(isCouponEligibleForEmail(activePromo, "guest@example.com")).toBe(true);

  });



  it("hasUserExceededCouponLimit: 1 uso por persona en promocionales", () => {

    expect(hasUserExceededCouponLimit(0, PROMOTIONAL_MAX_USES_PER_USER)).toBe(false);

    expect(hasUserExceededCouponLimit(1, PROMOTIONAL_MAX_USES_PER_USER)).toBe(true);

  });



  it("getPromotionalCouponStatus devuelve estado correcto", () => {

    expect(getPromotionalCouponStatus(activePromo)).toBe("ACTIVE");

    expect(getPromotionalCouponStatus({ ...activePromo, currentGlobalUses: 10 })).toBe(

      "EXHAUSTED"

    );

    expect(getPromotionalCouponStatus({ ...activePromo, isActive: false })).toBe("INACTIVE");

    expect(

      getPromotionalCouponStatus({

        ...activePromo,

        expiresAt: new Date("2020-01-01"),

      })

    ).toBe("EXPIRED");

  });



  it("getPromotionalCouponStatus devuelve SCHEDULED antes de validFrom", () => {

    const futureFrom = bogotaInstant("2099-06-15", "09:00");

    const futureTo = bogotaInstant("2099-06-15", "18:00");

    expect(

      getPromotionalCouponStatus({

        ...activePromo,

        scheduleMode: "SINGLE_DAY",

        validFrom: futureFrom,

        validTo: futureTo,

      })

    ).toBe("SCHEDULED");

  });



  it("getCouponScheduleStatus valida ventana horaria en día específico", () => {

    const validFrom = bogotaInstant("2026-06-15", "09:00");

    const validTo = bogotaInstant("2026-06-15", "18:00");

    const coupon = {

      scheduleMode: "SINGLE_DAY" as const,

      validFrom,

      validTo,

      expiresAt: null,

    };



    expect(getCouponScheduleStatus(coupon, bogotaInstant("2026-06-15", "08:59"))).toBe(

      "NOT_STARTED"

    );

    expect(getCouponScheduleStatus(coupon, bogotaInstant("2026-06-15", "10:00"))).toBe("VALID");

    expect(getCouponScheduleStatus(coupon, bogotaInstant("2026-06-15", "18:01"))).toBe("EXPIRED");

    expect(isCouponWithinSchedule(coupon, bogotaInstant("2026-06-15", "10:00"))).toBe(true);

    expect(isCouponWithinSchedule(coupon, bogotaInstant("2026-06-15", "18:01"))).toBe(false);

  });



  it("getCouponScheduleStatus valida rango de fechas completo", () => {

    const validFrom = bogotaDayStart("2026-06-10");

    const validTo = bogotaDayEnd("2026-06-20");

    const coupon = {

      scheduleMode: "DATE_RANGE" as const,

      validFrom,

      validTo,

      expiresAt: null,

    };



    expect(getCouponScheduleStatus(coupon, bogotaDayStart("2026-06-09"))).toBe("NOT_STARTED");

    expect(getCouponScheduleStatus(coupon, bogotaInstant("2026-06-15", "12:00"))).toBe("VALID");

    expect(getCouponScheduleStatus(coupon, bogotaDayEnd("2026-06-21"))).toBe("EXPIRED");

  });

});



describe("Coupon schedule — build and format", () => {

  it("buildCouponSchedule sin vigencia devuelve NONE", () => {

    expect(buildCouponSchedule({ scheduleEnabled: false })).toEqual({

      scheduleMode: "NONE",

      validFrom: null,

      validTo: null,

    });

  });



  it("buildCouponSchedule para día específico con horas", () => {

    const result = buildCouponSchedule({

      scheduleEnabled: true,

      scheduleMode: "SINGLE_DAY",

      singleDayDate: "2026-06-15",

      startTime: "09:00",

      endTime: "18:00",

    });

    expect(result.scheduleMode).toBe("SINGLE_DAY");

    expect(result.validFrom).toEqual(bogotaInstant("2026-06-15", "09:00"));

    expect(result.validTo).toEqual(bogotaInstant("2026-06-15", "18:00"));

  });



  it("buildCouponSchedule para rango de fechas", () => {

    const result = buildCouponSchedule({

      scheduleEnabled: true,

      scheduleMode: "DATE_RANGE",

      fromDate: "2026-06-10",

      toDate: "2026-06-20",

    });

    expect(result.scheduleMode).toBe("DATE_RANGE");

    expect(result.validFrom).toEqual(bogotaDayStart("2026-06-10"));

    expect(result.validTo).toEqual(bogotaDayEnd("2026-06-20"));

  });



  it("formatCouponScheduleLabel muestra sin límite y rangos", () => {

    expect(formatCouponScheduleLabel({ scheduleMode: "NONE" })).toBe("Sin límite");

    expect(

      formatCouponScheduleLabel({

        scheduleMode: "DATE_RANGE",

        validFrom: bogotaDayStart("2026-06-10"),

        validTo: bogotaDayEnd("2026-06-20"),

      })

    ).toContain("–");

  });

});



describe("validateCouponTimeWindow — orquestador", () => {

  const window = {

    scheduleMode: "SINGLE_DAY" as const,

    validFrom: bogotaInstant("2026-06-15", "09:00"),

    validTo: bogotaInstant("2026-06-15", "18:00"),

    expiresAt: null,

  };



  it("lanza CouponNotYetValidError si aún no inicia", () => {

    expect(() =>

      validateCouponTimeWindow(window, bogotaInstant("2026-06-15", "08:00"))

    ).toThrow(CouponNotYetValidError);

  });



  it("lanza CouponExpiredError si ya expiró", () => {

    expect(() =>

      validateCouponTimeWindow(window, bogotaInstant("2026-06-15", "19:00"))

    ).toThrow(CouponExpiredError);

  });



  it("no lanza dentro de la ventana", () => {

    expect(() =>

      validateCouponTimeWindow(window, bogotaInstant("2026-06-15", "12:00"))

    ).not.toThrow();

  });

});



describe("Coupon domain — discount calculation", () => {

  it("calculateCouponDiscountAmount aplica porcentaje", () => {

    expect(calculateCouponDiscountAmount(100000, "PERCENTAGE", 20)).toBe(20000);

  });



  it("calculateCouponDiscountAmount aplica monto fijo sin exceder subtotal", () => {

    expect(calculateCouponDiscountAmount(50000, "FIXED", 30000)).toBe(30000);

    expect(calculateCouponDiscountAmount(20000, "FIXED", 30000)).toBe(20000);

  });



  it("formatCouponDiscountLabel formatea % y fijo", () => {

    expect(formatCouponDiscountLabel("PERCENTAGE", 15)).toBe("15%");

    expect(formatCouponDiscountLabel("FIXED", 50000)).toContain("50");

  });

});


