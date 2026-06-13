import { prisma } from "@/lib/prisma";
import type {
  CouponListQueryDTO,
  CouponListResponseDTO,
  CreatePromotionalCouponInputDTO,
  GenerateCouponsInputDTO,
  GenerateCouponsResponseDTO,
  PromotionalCouponListItemDTO,
  PromotionalCouponListResponseDTO,
  PromotionalCouponUsageItemDTO,
} from "../contracts/coupon.dto";
import {
  generateCouponCode,
  MAX_COLLISION_RETRIES,
  normalizeCouponCode,
} from "../domain/coupon-code.entity";
import { PROMOTIONAL_MAX_USES_PER_USER } from "@/modules/checkout/domain/coupon.entity";
import { buildCouponSchedule } from "@/modules/checkout/domain/coupon-schedule";
import {
  mapCouponToListItem,
  mapPromotionalCouponToListItem,
  mapPromotionalUsageToItem,
} from "../presentation/mappers";

export class PrismaCouponAdminRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async listCoupons(query: CouponListQueryDTO): Promise<CouponListResponseDTO> {
    const skip = (query.page - 1) * query.limit;
    const baseWhere = { kind: "BATCH_SINGLE" as const };
    const where = query.search
      ? {
          ...baseWhere,
          code: { contains: query.search.toUpperCase(), mode: "insensitive" as const },
        }
      : baseWhere;

    const [total, coupons] = await Promise.all([
      this.db.coupon.count({ where }),
      this.db.coupon.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip,
        include: { batch: { select: { createdAt: true } } },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / query.limit));

    return {
      data: coupons.map(mapCouponToListItem),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPrevPage: query.page > 1,
      },
    };
  }

  async generateCoupons(input: GenerateCouponsInputDTO): Promise<GenerateCouponsResponseDTO> {
    return this.db.$transaction(async (tx: typeof this.db) => {
      const batch = await tx.couponBatch.create({
        data: {
          discountPercentage: input.discountPercentage,
          quantity: input.quantity,
          createdById: input.createdById ?? null,
        },
      });

      const createdCoupons = [];

      for (let i = 0; i < input.quantity; i++) {
        let inserted = false;

        for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
          const code = generateCouponCode();
          try {
            const coupon = await tx.coupon.create({
              data: {
                code,
                kind: "BATCH_SINGLE",
                discountType: "PERCENTAGE",
                discountValue: input.discountPercentage,
                discountPercentage: input.discountPercentage,
                batchId: batch.id,
                assignedEmail: null,
                isUsed: false,
                maxGlobalUses: 1,
              },
              include: { batch: { select: { createdAt: true } } },
            });
            createdCoupons.push(coupon);
            inserted = true;
            break;
          } catch (err: unknown) {
            const isUniqueViolation =
              typeof err === "object" &&
              err !== null &&
              "code" in err &&
              (err as { code?: string }).code === "P2002";
            if (!isUniqueViolation) throw err;
          }
        }

        if (!inserted) {
          throw new Error("No se pudo generar un código único tras varios intentos");
        }
      }

      return {
        batch: {
          id: batch.id,
          discountPercentage: batch.discountPercentage,
          quantity: batch.quantity,
          createdAt: batch.createdAt.toISOString(),
        },
        coupons: createdCoupons.map(mapCouponToListItem),
      };
    });
  }

  async findById(id: string) {
    return this.db.coupon.findUnique({ where: { id } });
  }

  async deleteCoupon(id: string): Promise<{ success: boolean; id: string }> {
    await this.db.coupon.delete({ where: { id } });
    return { success: true, id };
  }

  async getCouponUsageDetail(couponId: string) {
    const coupon = await this.db.coupon.findUnique({
      where: { id: couponId },
      select: {
        id: true,
        code: true,
        discountPercentage: true,
        isUsed: true,
        usedAt: true,
        usedByOrderId: true,
      },
    });

    if (!coupon) return null;

    if (!coupon.isUsed || !coupon.usedByOrderId) {
      return { coupon, order: null };
    }

    const order = await this.db.order.findUnique({
      where: { id: coupon.usedByOrderId },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    return { coupon, order };
  }

  async createPromotionalCoupon(
    input: CreatePromotionalCouponInputDTO
  ): Promise<PromotionalCouponListItemDTO> {
    const schedule = buildCouponSchedule({
      scheduleEnabled: input.scheduleEnabled,
      scheduleMode: input.scheduleMode,
      singleDayDate: input.singleDayDate,
      startTime: input.startTime,
      endTime: input.endTime,
      fromDate: input.fromDate,
      toDate: input.toDate,
    });

    const baseData = {
      kind: "PROMOTIONAL" as const,
      discountType: input.discountType,
      discountValue: input.discountValue,
      discountPercentage:
        input.discountType === "PERCENTAGE" ? input.discountValue : 0,
      maxGlobalUses: input.maxGlobalUses,
      maxUsesPerUser: PROMOTIONAL_MAX_USES_PER_USER,
      currentGlobalUses: 0,
      scheduleMode: schedule.scheduleMode,
      validFrom: schedule.validFrom,
      validTo: schedule.validTo,
      expiresAt: null,
      isActive: true,
      assignedEmail: null,
      isUsed: false,
    };

    if (input.codeSource === "CUSTOM") {
      if (!input.code?.trim()) {
        throw new Error("El nombre personalizado es obligatorio");
      }
      const code = normalizeCouponCode(input.code);
      try {
        const coupon = await this.db.coupon.create({
          data: {
            code,
            codeSource: "CUSTOM",
            ...baseData,
          },
        });
        return mapPromotionalCouponToListItem(coupon);
      } catch (err: unknown) {
        const isUniqueViolation =
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          (err as { code?: string }).code === "P2002";
        if (isUniqueViolation) {
          throw new Error("Ese nombre de cupón ya existe");
        }
        throw err;
      }
    }

    let inserted = false;
    let coupon = null;

    for (let attempt = 0; attempt < MAX_COLLISION_RETRIES; attempt++) {
      const code = generateCouponCode();
      try {
        coupon = await this.db.coupon.create({
          data: {
            code,
            codeSource: "RANDOM",
            ...baseData,
          },
        });
        inserted = true;
        break;
      } catch (err: unknown) {
        const isUniqueViolation =
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          (err as { code?: string }).code === "P2002";
        if (!isUniqueViolation) throw err;
      }
    }

    if (!inserted || !coupon) {
      throw new Error("No se pudo generar un código único tras varios intentos");
    }

    return mapPromotionalCouponToListItem(coupon);
  }

  async listPromotionalCoupons(
    query: CouponListQueryDTO
  ): Promise<PromotionalCouponListResponseDTO> {
    const skip = (query.page - 1) * query.limit;
    const baseWhere = { kind: "PROMOTIONAL" as const };
    const where = query.search
      ? {
          ...baseWhere,
          code: { contains: query.search.toUpperCase(), mode: "insensitive" as const },
        }
      : baseWhere;

    const [total, coupons] = await Promise.all([
      this.db.coupon.count({ where }),
      this.db.coupon.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit,
        skip,
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / query.limit));

    return {
      data: coupons.map(mapPromotionalCouponToListItem),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPrevPage: query.page > 1,
      },
    };
  }

  async listPromotionalCouponUsages(couponId: string): Promise<PromotionalCouponUsageItemDTO[]> {
    const usages = await this.db.couponUsage.findMany({
      where: { couponId },
      orderBy: { usedAt: "desc" },
      include: {
        order: { select: { orderNumber: true, status: true } },
      },
    });
    return usages.map(mapPromotionalUsageToItem);
  }

  async deactivatePromotionalCoupon(id: string): Promise<{ success: boolean; id: string }> {
    const coupon = await this.db.coupon.findFirst({ where: { id, kind: "PROMOTIONAL" } });
    if (!coupon) throw new Error("Cupón promocional no encontrado");
    await this.db.coupon.update({
      where: { id },
      data: { isActive: false },
    });
    return { success: true, id };
  }

  async deletePromotionalCoupon(id: string): Promise<{ success: boolean; id: string }> {
    const coupon = await this.db.coupon.findFirst({ where: { id, kind: "PROMOTIONAL" } });
    if (!coupon) throw new Error("Cupón promocional no encontrado");
    await this.db.coupon.delete({ where: { id } });
    return { success: true, id };
  }

  async findPromotionalById(id: string) {
    return this.db.coupon.findFirst({ where: { id, kind: "PROMOTIONAL" } });
  }
}
