import { PrismaPromoPopupRepository } from "../infrastructure/prisma-promo-popup.repository";

const repository = new PrismaPromoPopupRepository();

export async function listPromoPopupsUseCase() {
  return repository.list();
}
