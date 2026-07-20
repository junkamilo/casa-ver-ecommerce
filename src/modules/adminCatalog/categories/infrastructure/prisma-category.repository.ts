import { prisma } from "@/lib/prisma";
import type { CategoryListItemDTO } from "../contracts/category.dto";

type CategoryCreateData = {
  name: string;
  slug: string;
  image: string | null;
  garmentTypeIds: string[];
  order: number;
};

type CategoryUpdateData = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  garmentTypeIds: string[];
};

export class PrismaCategoryRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async listCategories(): Promise<CategoryListItemDTO[]> {
    const categories = await this.db.category.findMany({
      orderBy: { order: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        isActive: true,
        order: true,
        _count: { select: { products: true } },
        garmentTypes: {
          select: {
            garmentType: { select: { id: true, name: true } },
          },
        },
      },
    });

    return categories.map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (cat: any): CategoryListItemDTO => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
        isActive: cat.isActive,
        order: cat.order,
        _count: { products: cat._count?.products ?? 0 },
        garmentTypes: (cat.garmentTypes ?? []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (cgt: any) => cgt.garmentType
        ),
      })
    );
  }

  async findBySlug(slug: string) {
    return this.db.category.findUnique({ where: { slug } });
  }

  async findBySlugExcludingId(slug: string, id: string) {
    return this.db.category.findFirst({ where: { slug, NOT: { id } } });
  }

  async findById(id: string) {
    const category = await this.db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!category) return null;
    return category;
  }

  async findCategoryBaseById(id: string) {
    return this.db.category.findUnique({
      where: { id },
      select: { id: true, name: true, image: true },
    });
  }

  async getNextOrder(): Promise<number> {
    const maxOrderResult = await this.db.category.aggregate({ _max: { order: true } });
    return (maxOrderResult._max.order ?? 0) + 1;
  }

  async createCategory(data: CategoryCreateData) {
    return this.db.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        image: data.image,
        order: data.order,
        garmentTypes: data.garmentTypeIds.length
          ? {
              create: data.garmentTypeIds.map((garmentTypeId) => ({ garmentTypeId })),
            }
          : undefined,
      },
    });
  }

  async toggleActive(id: string, isActive: boolean) {
    return this.db.category.update({
      where: { id },
      data: { isActive },
    });
  }

  async updateCategoryAndReplaceGarments(
    data: CategoryUpdateData
  ): Promise<{ category: unknown; previousImage: string | null }> {
    return this.db.$transaction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (tx: any) => {
        const existing = await tx.category.findUnique({
          where: { id: data.id },
          select: { image: true },
        });
        if (!existing) {
          return { category: null, previousImage: null };
        }

        await tx.categoryGarmentType.deleteMany({ where: { categoryId: data.id } });

        const category = await tx.category.update({
          where: { id: data.id },
          data: {
            name: data.name,
            slug: data.slug,
            image: data.image,
            garmentTypes: data.garmentTypeIds.length
              ? {
                  create: data.garmentTypeIds.map((garmentTypeId) => ({ garmentTypeId })),
                }
              : undefined,
          },
        });

        return { category, previousImage: existing.image ?? null };
      }
    );
  }

  async countActiveProductsByCategory(id: string): Promise<number> {
    return this.db.product.count({
      where: {
        status: "ACTIVE",
        categories: { some: { categoryId: id } },
      },
    });
  }

  async deleteCategoryWithRelations(id: string): Promise<{ previousImage: string | null }> {
    return this.db.$transaction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async (tx: any) => {
        const existing = await tx.category.findUnique({
          where: { id },
          select: { image: true },
        });
        const previousImage = existing?.image ?? null;

        await tx.categoryGarmentType.deleteMany({ where: { categoryId: id } });
        await tx.category.delete({ where: { id } });

        return { previousImage };
      }
    );
  }
}
