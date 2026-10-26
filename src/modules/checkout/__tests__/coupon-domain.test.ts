/** @jest-environment node */



import {

  calculateCouponDiscountAmount,

  formatCouponDiscountLabel,

  getCouponScheduleStatus,




  isCouponExpired,


  isCouponWithinSchedule,



} from "@/modules/checkout/domain/coupon.entity";

import {

  bogotaDayEnd,

  bogotaDayStart,

  bogotaInstant,

  buildCouponSchedule,

  formatCouponScheduleLabel,

} from "@/modules/checkout/domain/coupon-schedule";


describe("Coupon domain — vigencia", () => {

  it("isCouponExpired detecta expiración legacy", () => {

    const past = new Date("2020-01-01");

    expect(isCouponExpired(past)).toBe(true);

    expect(isCouponExpired(null)).toBe(false);

    expect(isCouponExpired(new Date("2099-01-01"))).toBe(false);

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


