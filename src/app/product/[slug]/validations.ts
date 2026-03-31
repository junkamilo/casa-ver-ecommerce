import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().int().min(1, "La calificación mínima es 1").max(5, "La calificación máxima es 5"),
  comment: z
    .string()
    .trim()
    .max(500, "El comentario no puede superar los 500 caracteres")
    .refine(
      (v) => !/<[^>]*>/.test(v),
      "El comentario no puede contener etiquetas HTML"
    )
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
