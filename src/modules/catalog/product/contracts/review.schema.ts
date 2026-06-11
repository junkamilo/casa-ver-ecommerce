import { z } from "zod";

// Zod schema usado tanto en el cliente (formulario) como en el servidor
// (`saveReviewUseCase`). La validación que llega al use case ya está parseada
// por el formulario, pero re-validamos en el servidor por seguridad.

export const reviewSchema = z.object({
  rating: z
    .number()
    .refine((v) => typeof v === "number" && Number.isFinite(v), {
      message: "La calificación debe ser un número",
    })
    .int("La calificación debe ser un número entero")
    .min(1, "La calificación mínima es 1")
    .max(5, "La calificación máxima es 5"),
  comment: z
    .string()
    .trim()
    .max(500, "El comentario no puede superar los 500 caracteres")
    .refine(
      (v) => !/<[^>]*>/.test(v),
      "El comentario no puede contener etiquetas HTML",
    )
    .optional()
    .transform((v) => (v === undefined || v === "" ? null : v)),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
