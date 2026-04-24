import { PrismaHeroRepository } from "../infrastructure/prisma-hero.repository";
import { isValidCloudinaryUrl } from "../domain/hero.entity";
import { createHeroSlideSchema, updateHeroSlideSchema } from "../contracts/hero.schema";
import { HeroUnauthorizedError, HeroValidationError } from "./hero.errors";

const heroRepository = new PrismaHeroRepository();

function authorizeAdmin(userRole?: string) {
  if (userRole !== "ADMIN") {
    throw new HeroUnauthorizedError();
  }
}

export async function getActiveHeroSlidesUseCase() {
  return heroRepository.getActiveSlides();
}

export async function getAllHeroSlidesUseCase() {
  return heroRepository.getAllSlides();
}

export async function createHeroSlideUseCase(input: unknown, userRole?: string) {
  authorizeAdmin(userRole);
  const parsed = createHeroSlideSchema.safeParse(input);
  if (!parsed.success) {
    throw new HeroValidationError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  if (!isValidCloudinaryUrl(parsed.data.mediaUrl)) {
    throw new HeroValidationError("URL de media inválida. Debe ser de Cloudinary.");
  }
  const nextPosition = await heroRepository.getNextPosition();
  return heroRepository.createSlide(parsed.data, nextPosition);
}

export async function updateHeroSlideUseCase(input: unknown, userRole?: string) {
  authorizeAdmin(userRole);
  const parsed = updateHeroSlideSchema.safeParse(input);
  if (!parsed.success) {
    throw new HeroValidationError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }
  if (
    parsed.data.mediaUrl !== undefined &&
    parsed.data.mediaUrl !== "" &&
    !isValidCloudinaryUrl(parsed.data.mediaUrl)
  ) {
    throw new HeroValidationError("URL de media inválida. Debe ser de Cloudinary.");
  }
  return heroRepository.updateSlide(parsed.data.id, parsed.data);
}

export async function deleteHeroSlideUseCase(id: string | null, userRole?: string) {
  authorizeAdmin(userRole);
  if (!id) {
    throw new HeroValidationError("id requerido para eliminar");
  }
  await heroRepository.deleteSlideAndReorder(id);
  return { ok: true };
}
