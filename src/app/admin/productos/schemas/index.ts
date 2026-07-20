import { z } from "zod";
import { isValidMediaUrl } from "@/lib/media-url";

// Schema para producto simple (description y basePrice requeridos)
export const productFormSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().min(10, "Mínimo 10 caracteres"),
  basePrice: z.coerce
    .number()
    .positive("Debe ser mayor a 0"),
  comparePrice: z.coerce
    .number()
    .positive("Debe ser mayor a 0")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  stock: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(0, "Stock mínimo 0"),
  categoryIds: z.array(z.string().min(1)).min(1, "Selecciona al menos una categoría"),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || isValidMediaUrl(v), "URL de video inválida (debe provenir de Bunny CDN)"),
});

// Schema para conjunto (description y basePrice opcionales — los tienen las subcategorías)
export const setProductFormSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().optional().or(z.literal("").transform(() => undefined)),
  basePrice: z.coerce
    .number()
    .min(0)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  comparePrice: z.coerce
    .number()
    .positive("Debe ser mayor a 0")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  stock: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(0, "Stock mínimo 0")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  categoryIds: z.array(z.string().min(1)).min(1, "Selecciona al menos una categoría"),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || isValidMediaUrl(v), "URL de video inválida (debe provenir de Bunny CDN)"),
});

export const setItemFormSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  price: z.coerce
    .number()
    .positive("El precio es requerido y debe ser mayor a 0"),
  comparePrice: z.coerce
    .number()
    .positive("Debe ser mayor a 0")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || isValidMediaUrl(v), "URL de video inválida (debe provenir de Bunny CDN)"),
});
