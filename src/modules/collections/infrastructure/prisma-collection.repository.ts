import { prisma } from "@/lib/prisma";
import type {
  CategoryListItemDTO,
  CategoryDetailDTO,
} from "../contracts/collection-product.dto";

export class PrismaCollectionRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  // ── Categories ─────────────────────────────────────────────────────────────

  /**
   * Lista categorías activas. Cuando `rootOnly` es true se filtra `parentId: null`
   * (usado por la página `/collections` que solo muestra categorías raíz).
   */
  async listActiveCategories(options?: {
    rootOnly?: boolean;
  }): Promise<CategoryListItemDTO[]> {
    return this.db.category.findMany({
      where: {
        isActive: true,
        // En la primera capa las categorías del POS vienen de su árbol (toPosCarouselItems).
        ...(options?.rootOnly ? { parentId: null, posWebId: null } : {}),
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        isActive: true,
      },
    });
  }

  async getCategoryBasicBySlug(slug: string): Promise<{ name: string } | null> {
    return this.db.category.findUnique({
      where: { slug, isActive: true },
      select: { name: true },
    });
  }

  async getCategoryDetailBySlug(slug: string): Promise<CategoryDetailDTO | null> {
    return this.db.category.findUnique({
      where: { slug, isActive: true },
      select: {
        name: true,
        description: true,
        metaTitle: true,
        metaDescription: true,
        image: true,
      },
    });
  }

  async getGarmentTypeBySlug(
    slug: string,
  ): Promise<{ id: string; name: string } | null> {
    return this.db.garmentType.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });
  }
}
