import { prisma } from "@/lib/prisma";
import { buildCouponSchedule } from "@/modules/checkout/domain/coupon-schedule";
import type {
  ActivePromoPopupDTO,
  CreatePromoPopupInputDTO,
  PromoPopupDetailDTO,
  PromoPopupListResponseDTO,
  PromoPopupPlacement,
  UpdatePromoPopupInputDTO,
} from "../contracts/promo-popup.dto";
import {
  mapPromoPopupToActive,
  mapPromoPopupToDetail,
  mapPromoPopupToListItem,
} from "../presentation/mappers";
import { PromoPopupNotFoundError } from "../application/promo-popup.errors";
import type { Prisma } from "@prisma/client";

export class PrismaPromoPopupRepository {
  private buildScheduleData(input: CreatePromoPopupInputDTO | UpdatePromoPopupInputDTO) {
    const schedule = buildCouponSchedule({
      scheduleEnabled: input.scheduleEnabled,
      scheduleMode: input.scheduleMode,
      singleDayDate: input.singleDayDate,
      startTime: input.startTime,
      endTime: input.endTime,
      fromDate: input.fromDate,
      toDate: input.toDate,
    });
    return {
      scheduleMode: schedule.scheduleMode,
      validFrom: schedule.validFrom,
      validTo: schedule.validTo,
    };
  }

  private async deactivateOthersInPlacement(
    tx: Prisma.TransactionClient,
    placement: PromoPopupPlacement,
    exceptId?: string
  ) {
    await tx.promoPopup.updateMany({
      where: {
        placement,
        isActive: true,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      data: { isActive: false },
    });
  }

  async list(): Promise<PromoPopupListResponseDTO> {
    const records = await prisma.promoPopup.findMany({
      orderBy: [{ placement: "asc" }, { createdAt: "desc" }],
    });
    return { data: records.map(mapPromoPopupToListItem) };
  }

  async findById(id: string): Promise<PromoPopupDetailDTO | null> {
    const record = await prisma.promoPopup.findUnique({ where: { id } });
    return record ? mapPromoPopupToDetail(record) : null;
  }

  async create(input: CreatePromoPopupInputDTO): Promise<PromoPopupDetailDTO> {
    const scheduleData = this.buildScheduleData(input);

    return prisma.$transaction(async (tx) => {
      if (input.isActive) {
        await this.deactivateOthersInPlacement(tx, input.placement);
      }

      const record = await tx.promoPopup.create({
        data: {
          name: input.name,
          placement: input.placement,
          isActive: input.isActive ?? false,
          headline: input.headline,
          subtitle: input.subtitle,
          couponCode: input.couponCode,
          disclaimer: input.disclaimer,
          ctaText: input.ctaText,
          ctaUrl: input.ctaUrl,
          delaySeconds: input.delaySeconds,
          ...scheduleData,
        },
      });

      return mapPromoPopupToDetail(record);
    });
  }

  async update(input: UpdatePromoPopupInputDTO): Promise<PromoPopupDetailDTO> {
    const scheduleData = this.buildScheduleData(input);

    return prisma.$transaction(async (tx) => {
      const existing = await tx.promoPopup.findUnique({ where: { id: input.id } });
      if (!existing) throw new PromoPopupNotFoundError();

      if (input.isActive) {
        await this.deactivateOthersInPlacement(tx, input.placement, input.id);
      }

      const record = await tx.promoPopup.update({
        where: { id: input.id },
        data: {
          name: input.name,
          placement: input.placement,
          isActive: input.isActive ?? false,
          headline: input.headline,
          subtitle: input.subtitle,
          couponCode: input.couponCode,
          disclaimer: input.disclaimer,
          ctaText: input.ctaText,
          ctaUrl: input.ctaUrl,
          delaySeconds: input.delaySeconds,
          ...scheduleData,
        },
      });

      return mapPromoPopupToDetail(record);
    });
  }

  async toggleActive(id: string, isActive: boolean): Promise<PromoPopupDetailDTO> {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.promoPopup.findUnique({ where: { id } });
      if (!existing) throw new PromoPopupNotFoundError();

      if (isActive) {
        await this.deactivateOthersInPlacement(tx, existing.placement, id);
      }

      const record = await tx.promoPopup.update({
        where: { id },
        data: { isActive },
      });

      return mapPromoPopupToDetail(record);
    });
  }

  async delete(id: string): Promise<{ success: boolean; id: string }> {
    const existing = await prisma.promoPopup.findUnique({ where: { id } });
    if (!existing) throw new PromoPopupNotFoundError();

    await prisma.promoPopup.delete({ where: { id } });
    return { success: true, id };
  }

  async findActiveByPlacement(placement: PromoPopupPlacement): Promise<ActivePromoPopupDTO | null> {
    const record = await prisma.promoPopup.findFirst({
      where: { placement, isActive: true },
      orderBy: { updatedAt: "desc" },
    });
    return record ? mapPromoPopupToActive(record) : null;
  }
}
