import { z } from "zod";

const requiredIdSchema = z.string().trim().min(1, "ID requerido");

const garmentTypeEditableSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede superar 80 caracteres"),
});

export const createGarmentTypeInputSchema = garmentTypeEditableSchema;

export const updateGarmentTypeInputSchema = garmentTypeEditableSchema.extend({
  id: requiredIdSchema,
});

export const toggleGarmentTypeInputSchema = z.object({
  id: requiredIdSchema,
  action: z.literal("toggle"),
});

export const deleteGarmentTypeInputSchema = z.object({
  id: requiredIdSchema,
});
