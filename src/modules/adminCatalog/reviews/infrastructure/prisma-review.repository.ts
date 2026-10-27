import { prisma } from "@/lib/prisma";
import type { ReviewsListResponseDTO, ReviewsQueryInputDTO, ReviewStatus } from "../contracts/review.dto";

export class PrismaReviewRepository {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private readonly db: any;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.db = prisma as any;
  }

  async listReviews(input: ReviewsQueryInputDTO): Promise<ReviewsListResponseDTO> {
    const where = {
      ...(input.status !== "ALL" ? { status: input.status } : {}),
      ...(input.search
        ? {
            OR: [
              { comment: { contains: input.search, mode: "insensitive" as const } },
              { guestName: { contains: input.search, mode: "insensitive" as const } },
              { user: { name: { contains: input.search, mode: "insensitive" as const } } },
              { productName: { contains: input.search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const skip = (input.page - 1) * input.limit;
    const [rows, total] = await Promise.all([
      this.db.review.findMany({
        where,
        include: {
          order: { select: { orderNumber: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: input.limit,
      }),
      this.db.review.count({ where }),
    ]);

    // La reseña guarda slug y nombre del producto (sin FK: el producto puede vivir solo en el POS).
    const reviews = rows.map(
      ({ productSlug, productName, ...review }: { productSlug: string; productName: string | null }) => ({
        ...review,
        product: { id: productSlug, name: productName ?? productSlug, slug: productSlug },
      }),
    );
    return { reviews, total, page: input.page, totalPages: Math.ceil(total / input.limit) };
  }

  async updateReviewStatus(id: string, status: ReviewStatus) {
    return this.db.review.update({ where: { id }, data: { status } });
  }

  async findReviewProduct(id: string) {
    return this.db.review.findUnique({ where: { id }, select: { productSlug: true } });
  }

  async deleteReview(id: string) {
    return this.db.review.delete({ where: { id } });
  }
}
