import { activePromoPopupQuerySchema } from "../contracts/promo-popup.schema";
import { isPromoPopupInSchedule } from "../domain/promo-popup.entity";
import { PrismaPromoPopupRepository } from "../infrastructure/prisma-promo-popup.repository";
import { PromoPopupValidationError } from "./promo-popup.errors";

const repository = new PrismaPromoPopupRepository();

export async function getActivePromoPopupUseCase(input: unknown) {
  const parsed = activePromoPopupQuerySchema.safeParse(input);
  if (!parsed.success) {
    throw new PromoPopupValidationError(parsed.error.issues[0]?.message ?? "Parámetros inválidos");
  }

  const record = await repository.findActiveByPlacement(parsed.data.placement);
  if (!record) return null;

  const full = await repository.findById(record.id);
  if (!full) return null;

  if (
    !isPromoPopupInSchedule(
      {
        scheduleMode: full.scheduleMode,
        validFrom: full.validFrom,
        validTo: full.validTo,
      },
      new Date()
    )
  ) {
    return null;
  }

  return record;
}
