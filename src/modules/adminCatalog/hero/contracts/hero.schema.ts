import { z } from "zod";

const heroMediaTypeSchema = z.enum(["image", "video"]);

export const createHeroSlideSchema = z.object({
  mediaUrl: z.string().trim().min(1, "URL de media requerida"),
  mediaType: heroMediaTypeSchema,
  headline: z.string().trim().optional().nullable(),
  subheadline: z.string().trim().optional().nullable(),
});

export const updateHeroSlideSchema = z.object({
  id: z.string().trim().min(1, "id requerido"),
  mediaUrl: z.string().trim().optional(),
  mediaType: heroMediaTypeSchema.optional(),
  headline: z.string().trim().optional().nullable(),
  subheadline: z.string().trim().optional().nullable(),
});