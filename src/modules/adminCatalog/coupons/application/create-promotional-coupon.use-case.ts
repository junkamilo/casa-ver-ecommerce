import { createPromotionalCouponSchema } from "../contracts/coupon.schema";

import type { CreatePromotionalCouponInputDTO } from "../contracts/coupon.dto";

import { PrismaCouponAdminRepository } from "../infrastructure/prisma-coupon-admin.repository";

import { CouponValidationError } from "./coupon.errors";



const couponRepository = new PrismaCouponAdminRepository();



export async function createPromotionalCouponUseCase(input: unknown) {

  const parsed = createPromotionalCouponSchema.safeParse(input);

  if (!parsed.success) {

    const firstIssue = parsed.error.issues[0];

    throw new CouponValidationError(firstIssue?.message ?? "Datos inválidos");

  }



  const payload: CreatePromotionalCouponInputDTO = {

    codeSource: parsed.data.codeSource,

    code: parsed.data.code,

    discountType: parsed.data.discountType,

    discountValue: parsed.data.discountValue,

    maxGlobalUses: parsed.data.maxGlobalUses,

    scheduleEnabled: parsed.data.scheduleEnabled,

    scheduleMode: parsed.data.scheduleMode,

    singleDayDate: parsed.data.singleDayDate,

    startTime: parsed.data.startTime,

    endTime: parsed.data.endTime,

    fromDate: parsed.data.fromDate,

    toDate: parsed.data.toDate,

  };

  return couponRepository.createPromotionalCoupon(payload);

}


