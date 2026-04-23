import { z } from "zod";

const requiredIdSchema = z.string().trim().min(1, "ID requerido");

const categoryEditableFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede superar los 100 caracteres"),
  image: z.string().trim().optional().or(z.literal("")),
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
