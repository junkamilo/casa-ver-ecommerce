import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// ── Repositorio Prisma para PDP ──────────────────────────────────────────────
//
// Encapsula todas las queries del PDP (página de producto individual):
//   - Mega-query principal con includes profundos (productos de la web / respaldo si el POS no responde)
//   - Query SEO lite (solo lo necesario para metadata)
//   - Lookup user by email
//   - Social proof: compradores reales (orders PAID)
//   - Reseñas por slug + save/delete en $transaction con recálculo de rating + numReviews

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

  // ── Copia en Neon ──────────────────────────────────────────────────────

  /**
   * Fila de Neon del producto: los creados en la web viven aquí (`posSlug` null); los del POS tienen una
   * copia que sirve de respaldo si el POS no responde. `null` si no hay fila.
   */
  async findNeonProduct(slug: string): Promise<{ id: string; status: string; posSlug: string | null } | null> {
    return this.db.product.findUnique({
      where: { slug },
      select: { id: true, status: true, posSlug: true },
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
      },
    });
  }

  // ── Reseñas (por slug: sirven igual para productos del POS y de la web) ───

  async getApprovedReviews(slug: string) {
    return this.db.review.findMany({
      where: { productSlug: slug, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });
  }

  // ── Social proof ─────────────────────────────────────────────────────────

  /** `productKeys`: slug del producto y, si existe, su id de Neon (pedidos anteriores a la migración). */
  async getBuyerOrders(productKeys: string[]) {
    return this.db.order.findMany({
      where: { status: "PAID", items: { some: { productId: { in: productKeys } } } },
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

  async findOwnReview(userId: string, productSlug: string) {
    return this.db.review.findFirst({
      where: { userId, productSlug },
      select: { id: true },
    });
  }

  /** `productKeys`: slug del producto y, si existe, su id de Neon (pedidos anteriores a la migración). */
  async findPaidOrderForProduct(userId: string, productKeys: string[]) {
    return this.db.order.findFirst({
      where: {
        userId,
        status: "PAID",
        items: { some: { productId: { in: productKeys } } },
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
    productSlug: string;
    productName: string;
    orderId: string;
    rating: number;
    comment: string | null;
  }): Promise<void> {
    const { userId, productSlug, productName, orderId, rating, comment } = args;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.review.upsert({
        where: { orderId_productSlug: { orderId, productSlug } },
        update: { rating, comment: comment ?? "" },
        create: { userId, productSlug, productName, orderId, rating, comment: comment ?? "" },
      });
      await recomputeProductRating(tx, productSlug);
    });
  }

  /**
   * Borra la reseña del usuario y recalcula rating/numReviews del producto.
   * Equivalente al `$transaction` original en `actions/index.ts` (`deleteReview`).
   */
  async deleteReviewAndRecompute(args: {
    reviewId: string;
    productSlug: string;
  }): Promise<void> {
    const { reviewId, productSlug } = args;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.review.delete({ where: { id: reviewId } });
      await recomputeProductRating(tx, productSlug);
    });
  }
}

/** Rating y número de reseñas de la copia en Neon (si existe; el PDP los calcula en vivo). */
async function recomputeProductRating(tx: Prisma.TransactionClient, productSlug: string) {
  const agg = await tx.review.aggregate({
    where: { productSlug },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await tx.product.updateMany({
    where: { slug: productSlug },
    data: { rating: agg._avg.rating ?? 0, numReviews: agg._count.rating },
  });
}
