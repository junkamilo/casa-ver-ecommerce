import { prisma } from "@/lib/prisma";
import type {
  CouponListQueryDTO,
  CouponListResponseDTO,
  GenerateCouponsInputDTO,
  GenerateCouponsResponseDTO,
} from "../contracts/coupon.dto";
import {
  generateCouponCode,
  MAX_COLLISION_RETRIES,
} from "../domain/coupon-code.entity";
import { mapCouponToListItem } from "../presentation/mappers";

export class PrismaCouponAdminRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async listCoupons(query: CouponListQueryDTO): Promise<CouponListResponseDTO> {
    const skip = (query.page - 1) * query.limit;
    const where = query.search
      ? { code: { contains: query.search.toUpperCase(), mode: "insensitive" as const } }
      : undefined;

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
                discountPercentage: input.discountPercentage,
                batchId: batch.id,
                assignedEmail: null,
                isUsed: false,
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
}
