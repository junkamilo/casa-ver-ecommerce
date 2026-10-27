import { prisma } from "@/lib/prisma";

// ── Repositorio Prisma para PDP ──────────────────────────────────────────────
//
// Queries del PDP que viven en la web (el producto y sus reseñas se leen del POS):
//   - Lookup user by email
//   - Social proof: compradores reales (orders PAID)
//   - Compra verificada para reseñar (pedido pagado con el producto)

const PAID_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

export class PrismaProductDetailRepository {
  // ── Social proof ─────────────────────────────────────────────────────────

  /** `productKeys`: slugs del producto (los pedidos lo identifican por su slug). */
  async getBuyerOrders(productKeys: string[]) {
    return prisma.order.findMany({
      where: { status: "PAID", items: { some: { productId: { in: productKeys } } } },
      select: { shippingName: true, user: { select: { image: true } } },
      orderBy: { paidAt: "desc" },
      take: 50,
    });
  }

  // ── User lookup ──────────────────────────────────────────────────────────

  async getUserByEmail(email: string): Promise<{ id: string; name: string | null } | null> {
    return prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
  }

  // ── Compra verificada ────────────────────────────────────────────────────

  /** Pedido pagado más reciente de la clienta con el producto (por su slug). */
  async findPaidOrderForProduct(
    userId: string,
    productSlug: string,
  ): Promise<{ orderNumber: string; shippingName: string | null } | null> {
    return prisma.order.findFirst({
      where: {
        userId,
        status: { in: [...PAID_STATUSES] },
        items: { some: { productId: productSlug } },
      },
      select: { orderNumber: true, shippingName: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
