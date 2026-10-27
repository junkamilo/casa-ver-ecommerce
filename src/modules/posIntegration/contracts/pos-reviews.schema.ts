import { z } from "zod";

// Espejo de `ReviewDtos` del POS (md/COMPARACION-TABLAS-RESENAS-POS-vs-WEB.md): /api/public/reviews/**.

/** Reseña publicada (aprobada en el POS). `customerName` ya viene corto: «María G.». */
export const posPublicReviewSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  productSlug: z.string(),
  productName: z.string().nullish(),
  createdAt: z.string().nullish(),
});

export const posProductReviewsSchema = z.object({
  productSlug: z.string(),
  averageRating: z.number().nullish().transform((v) => v ?? null),
  totalReviews: z.number().int(),
  ratingDistribution: z.record(z.string(), z.number()).default({}),
  reviews: z.array(posPublicReviewSchema).default([]),
});

export const posReviewRequestResultSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.string().nullish(),
  customerName: z.string().nullish(),
  customerEmail: z.string().nullish(),
  productSlug: z.string(),
  productName: z.string().nullish(),
  orderNumber: z.string(),
});

export const posReviewTokenSchema = z.object({
  productSlug: z.string(),
  productName: z.string().nullish(),
  orderNumber: z.string(),
  customerName: z.string().nullish(),
});

export const posOwnReviewSchema = z.object({
  productSlug: z.string(),
  orderNumber: z.string(),
  rating: z.number().int(),
  comment: z.string(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export const posReviewSubmitResultSchema = z.object({ reviewId: z.string(), status: z.string() });

export const posReviewDeletedSchema = z.object({ deleted: z.boolean() });

export type PosPublicReview = z.infer<typeof posPublicReviewSchema>;
export type PosProductReviews = z.infer<typeof posProductReviewsSchema>;
export type PosReviewRequestResult = z.infer<typeof posReviewRequestResultSchema>;
export type PosReviewToken = z.infer<typeof posReviewTokenSchema>;
export type PosOwnReview = z.infer<typeof posOwnReviewSchema>;
