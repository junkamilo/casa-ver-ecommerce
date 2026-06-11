import { prisma } from "@/lib/prisma";
import type { GarmentTypeListItemDTO } from "../contracts/garment-type.dto";

type GarmentTypeCreateData = {
  name: string;
  slug: string;
  order: number;
};

type GarmentTypeUpdateData = {
  id: string;
  name: string;
  slug: string;
};

export class PrismaGarmentTypeRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async listGarmentTypes(): Promise<GarmentTypeListItemDTO[]> {
    return this.db.garmentType.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        order: true,
        isActive: true,
        _count: { select: { products: true, categories: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    return this.db.garmentType.findUnique({ where: { slug } });
  }

  async findBySlugExcludingId(slug: string, id: string) {
    return this.db.garmentType.findFirst({ where: { slug, NOT: { id } } });
  }

  async findById(id: string) {
    return this.db.garmentType.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
  }

  async getNextOrder(): Promise<number> {
    const maxOrder = await this.db.garmentType.aggregate({ _max: { order: true } });
    return (maxOrder._max.order ?? 0) + 1;
  }

  async createGarmentType(data: GarmentTypeCreateData) {
    return this.db.garmentType.create({ data });
  }

  async updateGarmentType(data: GarmentTypeUpdateData) {
    return this.db.garmentType.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
      },
    });
  }

  async toggleActive(id: string, isActive: boolean) {
    return this.db.garmentType.update({
      where: { id },
      data: { isActive },
    });
  }

  async deleteGarmentType(id: string) {
    return this.db.garmentType.delete({ where: { id } });
  }
}
