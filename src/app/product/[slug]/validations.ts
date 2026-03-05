import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .max(500, "El comentario no puede superar los 500 caracteres")
    .refine(
      (v) => !/<[^>]*>/.test(v),
      "El comentario no puede contener etiquetas HTML"
    )
    .optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
