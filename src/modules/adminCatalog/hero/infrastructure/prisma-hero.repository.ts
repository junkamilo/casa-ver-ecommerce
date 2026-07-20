import { prisma } from "@/lib/prisma";
import type { CreateHeroSlideInputDTO, UpdateHeroSlideInputDTO } from "../contracts/hero.dto";

export class PrismaHeroRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async getActiveSlides() {
    return this.db.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    });
  }

  async getAllSlides() {
    return this.db.heroSlide.findMany({
      orderBy: { position: "asc" },
    });
  }

  async getNextPosition(): Promise<number> {
    const last = await this.db.heroSlide.findFirst({ orderBy: { position: "desc" } });
    return (last?.position ?? 0) + 1;
  }

  async findSlideById(id: string) {
    return this.db.heroSlide.findUnique({
      where: { id },
      select: { id: true, mediaUrl: true },
    });
  }

  async createSlide(data: CreateHeroSlideInputDTO, position: number) {
    return this.db.heroSlide.create({
      data: {
        position,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        headline: data.headline || null,
        subheadline: data.subheadline || null,
      },
    });
  }

  async updateSlide(
    id: string,
    data: Partial<UpdateHeroSlideInputDTO>
  ): Promise<{ slide: unknown; previousMediaUrl: string | null }> {
    const existing = await this.db.heroSlide.findUnique({
      where: { id },
      select: { mediaUrl: true },
    });
    if (!existing) {
      return { slide: null, previousMediaUrl: null };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } = data;

    const slide = await this.db.heroSlide.update({
      where: { id },
      data: updateData,
    });

    return { slide, previousMediaUrl: existing.mediaUrl ?? null };
  }

  async deleteSlideAndReorder(id: string): Promise<{ previousMediaUrl: string | null }> {
    return this.db.$transaction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (tx: any) => {
        const existing = await tx.heroSlide.findUnique({
          where: { id },
          select: { mediaUrl: true },
        });
        const previousMediaUrl = existing?.mediaUrl ?? null;

        await tx.heroSlide.delete({ where: { id } });

        const remaining = await tx.heroSlide.findMany({ orderBy: { position: "asc" } });

        await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          remaining.map((s: any, i: number) =>
            tx.heroSlide.update({ where: { id: s.id }, data: { position: i + 1 } })
          )
        );

        return { previousMediaUrl };
      }
    );
  }
}
