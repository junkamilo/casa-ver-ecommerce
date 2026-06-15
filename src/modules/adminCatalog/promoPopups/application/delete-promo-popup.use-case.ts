import { deletePromoPopupSchema } from "../contracts/promo-popup.schema";
import { PrismaPromoPopupRepository } from "../infrastructure/prisma-promo-popup.repository";
import { PromoPopupValidationError } from "./promo-popup.errors";

const repository = new PrismaPromoPopupRepository();

export async function deletePromoPopupUseCase(input: unknown) {
  const parsed = deletePromoPopupSchema.safeParse(input);
  if (!parsed.success) {
    throw new PromoPopupValidationError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  return repository.delete(parsed.data.id);
}
