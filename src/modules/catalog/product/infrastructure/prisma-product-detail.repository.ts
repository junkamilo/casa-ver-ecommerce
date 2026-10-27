import { prisma } from "@/lib/prisma";

// ── Repositorio Prisma para PDP ──────────────────────────────────────────────
//
// Queries del PDP que viven en la web (el producto se lee del POS):
//   - Lookup user by email
//   - Social proof: compradores reales (orders PAID)
//   - Reseñas por slug (el rating se calcula en vivo con las aprobadas)

export class PrismaProductDetailRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  // ── Reseñas (por slug del POS) ───

  async getApprovedReviews(slug: string) {
    return this.db.review.findMany({
      where: { productSlug: slug, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });
  }

  // ── Social proof ─────────────────────────────────────────────────────────

  /** `productKeys`: slugs del producto (los pedidos lo identifican por su slug). */
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

  /** `productKeys`: slugs del producto (los pedidos lo identifican por su slug). */
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

  /** Crea o actualiza la reseña del usuario para ese pedido y producto. */
  async upsertReview(args: {
    userId: string;
    productSlug: string;
    productName: string;
    orderId: string;
    rating: number;
    comment: string | null;
  }): Promise<void> {
    const { userId, productSlug, productName, orderId, rating, comment } = args;
    await prisma.review.upsert({
      where: { orderId_productSlug: { orderId, productSlug } },
      update: { rating, comment: comment ?? "" },
      create: { userId, productSlug, productName, orderId, rating, comment: comment ?? "" },
    });
  }

  /** Borra la reseña del usuario. */
  async deleteReview(args: { reviewId: string; productSlug: string }): Promise<void> {
    await prisma.review.delete({ where: { id: args.reviewId } });
  }
}
