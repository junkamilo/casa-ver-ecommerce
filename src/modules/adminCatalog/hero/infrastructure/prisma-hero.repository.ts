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

  async getNextPosition(): Promise<number> {
    const last = await this.db.heroSlide.findFirst({ orderBy: { position: "desc" } });
    return (last?.position ?? 0) + 1;
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

  async updateSlide(id: string, data: Partial<UpdateHeroSlideInputDTO>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } = data; // Extraemos el ID para no mandarlo en la data de actualización

    return this.db.heroSlide.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteSlideAndReorder(id: string) {
    return this.db.$transaction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (tx: any) => {
        // 1. Eliminar
        await tx.heroSlide.delete({ where: { id } });

        // 2. Traer restantes ordenados
        const remaining = await tx.heroSlide.findMany({ orderBy: { position: "asc" } });

        // 3. Re-numerar posiciones
        await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          remaining.map((s: any, i: number) =>
            tx.heroSlide.update({ where: { id: s.id }, data: { position: i + 1 } })
          )
        );
      }
    );
  }
}