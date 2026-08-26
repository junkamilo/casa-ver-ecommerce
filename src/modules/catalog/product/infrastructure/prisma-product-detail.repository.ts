import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// ── Repositorio Prisma para PDP ──────────────────────────────────────────────
//
// Encapsula todas las queries del PDP (página de producto individual):
//   - Mega-query principal con includes profundos
//   - Query SEO lite (solo lo necesario para metadata)
//   - Lookup user by email
//   - Social proof: compradores reales (orders PAID)
//   - Save/delete review en $transaction con recálculo de rating + numReviews

export class PrismaProductDetailRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  // ── SEO ────────────────────────────────────────────────────────────────────

  async getProductForSeo(slug: string) {
    return this.db.product.findUnique({
      where: { slug, status: "ACTIVE" },
      select: {
        name: true,
        description: true,
        metaTitle: true,
        metaDescription: true,
        coverImageUrl: true,
        images: {
          where: { colorId: null },
          orderBy: { order: "asc" },
          take: 1,
          select: { url: true },
        },
      },
    });
  }

  // ── Mega-query principal ─────────────────────────────────────────────────

  async getProductDetail(slug: string) {
    return this.db.product.findUnique({
      where: { slug, status: "ACTIVE" },
      include: {
        images: { orderBy: { order: "asc" } },
        colors: {
          include: {
            images: { orderBy: { order: "asc" } },
            variants: {
              where: { isActive: true },
              select: { id: true, sku: true, size: true, stock: true },
              orderBy: { size: "asc" },
            },
          },
        },
        items: {
          orderBy: { order: "asc" },
          include: {
            colors: {
              include: {
                images: { orderBy: { order: "asc" } },
                variants: {
                  where: { isActive: true },
                  select: { id: true, sku: true, size: true, stock: true },
                },
              },
            },
          },
        },
        reviews: {
          where: { status: "APPROVED" },
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { name: true } },
          },
        },
      },
    });
  }

  async getRecommendedProducts(productId: string, slug: string, take = 4) {
    const links = await this.db.productCategory.findMany({
      where: { productId },
      select: { categoryId: true },
    });
    const categoryIds = links.map(
      (link: { categoryId: string }) => link.categoryId
    );
    if (categoryIds.length === 0) return [];

    return this.db.product.findMany({
      where: {
        status: "ACTIVE",
        slug: { not: slug },
        categories: { some: { categoryId: { in: categoryIds } } },
      },
      take,
      orderBy: { createdAt: "desc" },
      select: {
        name: true,
        slug: true,
        basePrice: true,
        comparePrice: true,
        isSet: true,
        isProductNew: true,
        isProductNewAt: true,
        isOnSale: true,
        images: {
          orderBy: { order: "asc" },
          take: 8,
          select: { url: true },
        },
        items: {
          orderBy: { order: "asc" },
          select: {
            price: true,
            comparePrice: true,
            colors: {
              select: {
                name: true,
                hexCode: true,
                images: {
                  orderBy: { order: "asc" },
                  take: 8,
                  select: { url: true },
                },
              },
            },
          },
        },
        colors: {
          select: {
            name: true,
            hexCode: true,
            images: {
              orderBy: { order: "asc" },
              take: 1,
              select: { url: true },
            },
            variants: { select: { stock: true } },
          },
          orderBy: { id: "asc" },
        },
      },
    });
  }

  // ── Social proof ─────────────────────────────────────────────────────────

  async getBuyerOrders(productId: string) {
    return this.db.order.findMany({
      where: { status: "PAID", items: { some: { productId } } },
      select: { shippingName: true, user: { select: { image: true } } },
      orderBy: { paidAt: "desc" },
      take: 50,
    });
  }

  // ── User lookup ──────────────────────────────────────────────────────────

  async getUserIdByEmail(email: string): Promise<string | null> {
    const user = await this.db.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  // ── Reviews CRUD (con tx) ────────────────────────────────────────────────

  async findProductForReview(productId: string) {
    return this.db.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true, status: true },
    });
  }

  async findProductSlugById(productId: string) {
    return this.db.product.findUnique({
      where: { id: productId },
      select: { id: true, slug: true },
    });
  }

  async findOwnReview(userId: string, productId: string) {
    return this.db.review.findFirst({
      where: { userId, productId },
      select: { id: true },
    });
  }

  async findPaidOrderForProduct(userId: string, productId: string) {
    return this.db.order.findFirst({
      where: {
        userId,
        status: "PAID",
        items: { some: { productId } },
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Upsert atómico de la reseña + recálculo del rating/numReviews del producto.
   * Equivalente al `$transaction` original en `actions/index.ts` (`saveReview`).
   */
  async upsertReviewAndRecompute(args: {
    userId: string;
    productId: string;
    orderId: string;
    rating: number;
    comment: string | null;
  }): Promise<void> {
    const { userId, productId, orderId, rating, comment } = args;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.review.upsert({
        where: { orderId_productId: { orderId, productId } },
        update: { rating, comment: comment ?? "" },
        create: { userId, productId, orderId, rating, comment: comment ?? "" },
      });

      const agg = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          rating: agg._avg.rating ?? 0,
          numReviews: agg._count.rating,
        },
      });
    });
  }

  /**
   * Borra la reseña del usuario y recalcula rating/numReviews del producto.
   * Equivalente al `$transaction` original en `actions/index.ts` (`deleteReview`).
   */
  async deleteReviewAndRecompute(args: {
    reviewId: string;
    productId: string;
  }): Promise<void> {
    const { reviewId, productId } = args;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.review.delete({ where: { id: reviewId } });

      const agg = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          rating: agg._avg.rating ?? 0,
          numReviews: agg._count.rating,
        },
      });
    });
  }
}
