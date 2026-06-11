import { z } from "zod";

const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
const requiredIdSchema = z.string().trim().min(1, "ID requerido");

const colorEditableFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(60, "El nombre no puede superar los 60 caracteres"),
  hexCode: z
    .string()
    .trim()
    .min(1, "El código de color es requerido")
    .regex(hexColorRegex, "El código de color debe ser un valor hexadecimal válido (ej: #FF0000)"),
});

export const createColorInputSchema = colorEditableFieldsSchema;

export const updateColorInputSchema = colorEditableFieldsSchema.extend({
  id: requiredIdSchema,
});

export const toggleColorInputSchema = z.object({
  id: requiredIdSchema,
  action: z.literal("toggle"),
});

export const deleteColorInputSchema = z.object({
  id: requiredIdSchema,
});
