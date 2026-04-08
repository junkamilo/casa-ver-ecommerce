import { z } from "zod";

const isValidUrl = (v: string) => {
  try {
    const url = new URL(v);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

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
  categoryId: z.string().min(1, "Selecciona una categoría"),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || isValidUrl(v), "URL de video inválida"),
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
  categoryId: z.string().min(1, "Selecciona una categoría"),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || isValidUrl(v), "URL de video inválida"),
});

export const setItemFormSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  price: z.coerce
    .number()
    .positive("Debe ser mayor a 0")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  comparePrice: z.coerce
    .number()
    .positive("Debe ser mayor a 0")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || isValidUrl(v), "URL de video inválida"),
});

export type ProductFormErrors = Partial<
  Record<
    "name" | "description" | "basePrice" | "comparePrice" | "stock" | "categoryId" | "videoUrl",
    string
  >
>;

export type SingleItemFormErrors = Partial<
  Record<"name" | "price" | "comparePrice" | "videoUrl", string>
>;

export type ItemFormErrors = Record<string, SingleItemFormErrors>;

// ── Sub-producto (sin comparePrice — no está en el modelo SubProduct) ─────────
export const subProductFormSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  price: z.coerce
    .number()
    .positive("Debe ser mayor a 0")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || isValidUrl(v), "URL de video inválida"),
});

export type SingleSubProductFormErrors = Partial<
  Record<"name" | "price" | "videoUrl", string>
>;

export type SubProductFormErrors = Record<string, SingleSubProductFormErrors>;
