import { PrismaHeroRepository } from "../infrastructure/prisma-hero.repository";
import { isValidMediaUrl } from "../domain/hero.entity";
import { createHeroSlideSchema, updateHeroSlideSchema } from "../contracts/hero.schema";
import { HeroUnauthorizedError, HeroValidationError } from "./hero.errors";
import { deleteMediaAssetsByUrls } from "@/lib/media-admin";

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

  if (!isValidMediaUrl(parsed.data.mediaUrl)) {
    throw new HeroValidationError("URL de media inválida. Debe ser de Bunny CDN.");
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
    !isValidMediaUrl(parsed.data.mediaUrl)
  ) {
    throw new HeroValidationError("URL de media inválida. Debe ser de Bunny CDN.");
  }

  const { slide, previousMediaUrl } = await heroRepository.updateSlide(
    parsed.data.id,
    parsed.data
  );

  if (!slide) {
    throw new HeroValidationError("Slide no encontrado");
  }

  const nextMediaUrl =
    parsed.data.mediaUrl !== undefined ? parsed.data.mediaUrl.trim() || null : undefined;

  if (
    previousMediaUrl &&
    nextMediaUrl !== undefined &&
    previousMediaUrl !== nextMediaUrl
  ) {
    try {
      await deleteMediaAssetsByUrls([previousMediaUrl]);
    } catch (mediaError) {
      console.error("[HERO_UPDATE] Error limpiando archivos en Bunny", mediaError);
    }
  }

  return slide;
}

export async function deleteHeroSlideUseCase(id: string | null, userRole?: string) {
  authorizeAdmin(userRole);

  if (!id) {
    throw new HeroValidationError("id requerido para eliminar");
  }

  const { previousMediaUrl } = await heroRepository.deleteSlideAndReorder(id);

  if (previousMediaUrl) {
    try {
      await deleteMediaAssetsByUrls([previousMediaUrl]);
    } catch (mediaError) {
      console.error("[HERO_DELETE] Error limpiando archivos en Bunny", mediaError);
    }
  }

  return { ok: true };
}
