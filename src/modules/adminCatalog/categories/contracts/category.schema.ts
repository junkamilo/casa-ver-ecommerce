import { z } from "zod";
import { isValidMediaUrl } from "@/lib/media-url";

const requiredIdSchema = z.string().trim().min(1, "ID requerido");

const categoryEditableFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  image: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || isValidMediaUrl(val), {
      message: "URL de imagen inválida (debe provenir de Bunny CDN)",
    }),
  garmentTypeIds: z.array(z.string()).optional().default([]),
});

export const createCategoryInputSchema = categoryEditableFieldsSchema;

export const updateCategoryInputSchema = categoryEditableFieldsSchema.extend({
  id: requiredIdSchema,
});

export const toggleCategoryInputSchema = z.object({
  id: requiredIdSchema,
  action: z.literal("toggle"),
});

export const deleteCategoryInputSchema = z.object({
  id: requiredIdSchema,
});
