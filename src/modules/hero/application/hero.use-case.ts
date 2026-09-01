import { PrismaHeroRepository } from "../infrastructure/prisma-hero.repository";
import { isHeroMediaUrl } from "../domain/hero.entity";
import {
  createHeroSlideSchema,
  MAX_HERO_SLIDES,
  updateHeroSettingsSchema,
  updateHeroSlideSchema,
} from "../contracts/hero.schema";
import type { HeroPreviousMedia } from "../contracts/hero.dto";
import {
  HeroNotFoundError,
  HeroUnauthorizedError,
  HeroValidationError,
} from "./hero.errors";
import { deleteMediaAssetsByUrls } from "@/lib/media-admin";

const heroRepository = new PrismaHeroRepository();

function authorizeAdmin(userRole?: string) {
  if (userRole !== "ADMIN") {
    throw new HeroUnauthorizedError();
  }
}

function assertHeroMediaOrThrow(url: string) {
  if (!isHeroMediaUrl(url)) {
    throw new HeroValidationError(
      "URL de media inválida. Debe ser un archivo en Bunny bajo casa-verde/heroes/.",
    );
  }
}

function assertOptionalHeroMediaOrThrow(url: string | null | undefined) {
  if (url === undefined || url === null) return;
  assertHeroMediaOrThrow(url);
}

async function safeDeleteHeroMediaUrls(
  urls: Array<string | null | undefined>,
): Promise<{ deleted: number; failed: number }> {
  const unique = [
    ...new Set(urls.filter((u): u is string => Boolean(u && isHeroMediaUrl(u)))),
  ];
  if (unique.length === 0) return { deleted: 0, failed: 0 };
  try {
    await deleteMediaAssetsByUrls(unique);
    return { deleted: unique.length, failed: 0 };
  } catch (mediaError) {
    console.error("[HERO] Error limpiando archivos en Bunny", mediaError);
    return { deleted: 0, failed: unique.length };
  }
}

/** URLs in `previous` that are no longer referenced by `next`. */
function orphanedHeroUrls(
  previous: HeroPreviousMedia,
  next: {
    mediaUrl?: string | null;
    mediaUrlMobile?: string | null;
    mediaUrlTablet?: string | null;
    posterUrl?: string | null;
  },
): string[] {
  const stillUsed = new Set(
    [next.mediaUrl, next.mediaUrlMobile, next.mediaUrlTablet, next.posterUrl].filter(
      (u): u is string => Boolean(u),
    ),
  );
  return [
    previous.mediaUrl,
    previous.mediaUrlMobile,
    previous.mediaUrlTablet,
    previous.posterUrl,
  ].filter((u): u is string => Boolean(u) && !stillUsed.has(u!));
}

export async function getActiveHeroSlidesUseCase() {
  return heroRepository.getActiveSlides();
}

export async function getAllHeroSlidesUseCase() {
  return heroRepository.getAllSlides();
}

export async function getHeroSettingsUseCase() {
  return heroRepository.getOrCreateSettings();
}

export async function updateHeroSettingsUseCase(input: unknown, userRole?: string) {
  authorizeAdmin(userRole);

  const parsed = updateHeroSettingsSchema.safeParse(input);
  if (!parsed.success) {
    throw new HeroValidationError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  return heroRepository.upsertSettings(parsed.data);
}

export async function createHeroSlideUseCase(input: unknown, userRole?: string) {
  authorizeAdmin(userRole);

  const parsed = createHeroSlideSchema.safeParse(input);
  if (!parsed.success) {
    throw new HeroValidationError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const data = { ...parsed.data };

  assertHeroMediaOrThrow(data.mediaUrl);
  assertOptionalHeroMediaOrThrow(data.mediaUrlMobile);
  assertOptionalHeroMediaOrThrow(data.mediaUrlTablet);

  const total = await heroRepository.countSlides();
  if (total >= MAX_HERO_SLIDES) {
    throw new HeroValidationError(
      `Máximo ${MAX_HERO_SLIDES} slides. Elimina uno antes de agregar otro.`,
    );
  }

  const nextPosition = await heroRepository.getNextPosition();
  return heroRepository.createSlide(data, nextPosition);
}

export async function updateHeroSlideUseCase(input: unknown, userRole?: string) {
  authorizeAdmin(userRole);

  const parsed = updateHeroSlideSchema.safeParse(input);
  if (!parsed.success) {
    throw new HeroValidationError(parsed.error.issues[0]?.message ?? "Datos inválidos");
  }

  const data = { ...parsed.data };

  if (data.mediaUrl !== undefined) {
    assertHeroMediaOrThrow(data.mediaUrl);
  }
  assertOptionalHeroMediaOrThrow(data.mediaUrlMobile);
  assertOptionalHeroMediaOrThrow(data.mediaUrlTablet);

  const { slide, previous } = await heroRepository.updateSlide(data.id, data);

  if (!slide) {
    throw new HeroNotFoundError();
  }

  const slideRecord = slide as {
    mediaUrl?: string | null;
    mediaUrlMobile?: string | null;
    mediaUrlTablet?: string | null;
    posterUrl?: string | null;
  };

  const orphans = orphanedHeroUrls(previous, {
    mediaUrl: slideRecord.mediaUrl,
    mediaUrlMobile: slideRecord.mediaUrlMobile,
    mediaUrlTablet: slideRecord.mediaUrlTablet,
    posterUrl: slideRecord.posterUrl,
  });
  await safeDeleteHeroMediaUrls(orphans);

  return slide;
}

export async function deleteHeroSlideUseCase(id: string | null, userRole?: string) {
  authorizeAdmin(userRole);

  if (!id) {
    throw new HeroValidationError("id requerido para eliminar");
  }

  const existing = await heroRepository.findSlideById(id);
  if (!existing) {
    throw new HeroNotFoundError();
  }

  const { previous } = await heroRepository.deleteSlideAndReorder(id);
  const cleanup = await safeDeleteHeroMediaUrls([
    previous.mediaUrl,
    previous.mediaUrlMobile,
    previous.mediaUrlTablet,
    previous.posterUrl,
  ]);

  return { ok: true, mediaCleanupFailed: cleanup.failed > 0 };
}
