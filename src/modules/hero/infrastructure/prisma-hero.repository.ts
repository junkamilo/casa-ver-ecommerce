import { prisma } from "@/lib/prisma";
import type {
  CreateHeroSlideInputDTO,
  HeroPreviousMedia,
  UpdateHeroSettingsInputDTO,
  UpdateHeroSlideInputDTO,
} from "../contracts/hero.dto";

const DEFAULT_SLIDE_DURATION_MS = 6000;

const HERO_SLIDE_SELECT = {
  id: true,
  position: true,
  mediaUrl: true,
  mediaUrlMobile: true,
  mediaUrlTablet: true,
  posterUrl: true,
  mediaType: true,
  headline: true,
  subheadline: true,
  mediaFocus: true,
  playFullVideo: true,
  isActive: true,
  updatedAt: true,
} as const;

const PREVIOUS_MEDIA_SELECT = {
  mediaUrl: true,
  mediaUrlMobile: true,
  mediaUrlTablet: true,
  posterUrl: true,
} as const;

function emptyPreviousMedia(): HeroPreviousMedia {
  return {
    mediaUrl: null,
    mediaUrlMobile: null,
    mediaUrlTablet: null,
    posterUrl: null,
  };
}

export class PrismaHeroRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async countSlides(): Promise<number> {
    return this.db.heroSlide.count();
  }

  async getActiveSlides() {
    return this.db.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
      select: HERO_SLIDE_SELECT,
    });
  }

  async getAllSlides() {
    return this.db.heroSlide.findMany({
      orderBy: { position: "asc" },
      select: HERO_SLIDE_SELECT,
    });
  }

  async getNextPosition(): Promise<number> {
    const last = await this.db.heroSlide.findFirst({ orderBy: { position: "desc" } });
    return (last?.position ?? 0) + 1;
  }

  async findSlideById(id: string) {
    return this.db.heroSlide.findUnique({
      where: { id },
      select: { id: true, ...PREVIOUS_MEDIA_SELECT },
    });
  }

  async createSlide(data: CreateHeroSlideInputDTO, position: number) {
    const isVideo = data.mediaType === "video";
    return this.db.heroSlide.create({
      data: {
        position,
        mediaUrl: data.mediaUrl,
        mediaUrlMobile: isVideo ? null : (data.mediaUrlMobile ?? null),
        mediaUrlTablet: isVideo ? null : (data.mediaUrlTablet ?? null),
        mediaType: data.mediaType,
        headline: data.headline || null,
        subheadline: data.subheadline || null,
        mediaFocus: data.mediaFocus ?? undefined,
        playFullVideo: isVideo ? (data.playFullVideo ?? false) : false,
      },
    });
  }

  async updateSlide(
    id: string,
    data: Partial<UpdateHeroSlideInputDTO>,
  ): Promise<{ slide: unknown; previous: HeroPreviousMedia }> {
    const existing = await this.db.heroSlide.findUnique({
      where: { id },
      select: PREVIOUS_MEDIA_SELECT,
    });
    if (!existing) {
      return { slide: null, previous: emptyPreviousMedia() };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _omitId, ...rest } = data;
    const updateData = Object.fromEntries(
      Object.entries(rest).filter(([, value]) => value !== undefined),
    );

    if (updateData.mediaType === "image") {
      updateData.playFullVideo = false;
    }

    if (updateData.mediaType === "video") {
      updateData.mediaUrlMobile = null;
      updateData.mediaUrlTablet = null;
    }

    const slide = await this.db.heroSlide.update({
      where: { id },
      data: updateData,
    });

    return {
      slide,
      previous: {
        mediaUrl: existing.mediaUrl ?? null,
        mediaUrlMobile: existing.mediaUrlMobile ?? null,
        mediaUrlTablet: existing.mediaUrlTablet ?? null,
        posterUrl: existing.posterUrl ?? null,
      },
    };
  }

  async deleteSlideAndReorder(id: string): Promise<{ previous: HeroPreviousMedia }> {
    return this.db.$transaction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (tx: any) => {
        const existing = await tx.heroSlide.findUnique({
          where: { id },
          select: PREVIOUS_MEDIA_SELECT,
        });
        const previous: HeroPreviousMedia = {
          mediaUrl: existing?.mediaUrl ?? null,
          mediaUrlMobile: existing?.mediaUrlMobile ?? null,
          mediaUrlTablet: existing?.mediaUrlTablet ?? null,
          posterUrl: existing?.posterUrl ?? null,
        };

        await tx.heroSlide.delete({ where: { id } });

        const remaining = await tx.heroSlide.findMany({ orderBy: { position: "asc" } });

        await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          remaining.map((s: any, i: number) =>
            tx.heroSlide.update({ where: { id: s.id }, data: { position: i + 1 } }),
          ),
        );

        return { previous };
      },
    );
  }

  async getOrCreateSettings() {
    const existing = await this.db.heroSettings.findUnique({ where: { id: 1 } });
    if (existing) return existing;
    return this.db.heroSettings.create({
      data: { id: 1, slideDurationMs: DEFAULT_SLIDE_DURATION_MS },
    });
  }

  async upsertSettings(data: UpdateHeroSettingsInputDTO) {
    return this.db.heroSettings.upsert({
      where: { id: 1 },
      create: { id: 1, slideDurationMs: data.slideDurationMs },
      update: { slideDurationMs: data.slideDurationMs },
    });
  }
}

export { DEFAULT_SLIDE_DURATION_MS };
