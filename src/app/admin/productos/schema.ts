import { z } from "zod";

const isValidUrl = (v: string) => {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};

export const productFormSchema = z.object({
  name: z.string().min(3, "Mínimo 3 caracteres"),
  description: z.string().min(10, "Mínimo 10 caracteres"),
  basePrice: z
    .string()
    .min(1, "El precio es requerido")
    .refine((v) => parseFloat(v) > 0, "Debe ser mayor a 0"),
  comparePrice: z
    .string()
    .optional()
    .refine((v) => !v || parseFloat(v) > 0, "Debe ser mayor a 0"),
  stock: z.string().min(1, "El stock es requerido"),
  categoryId: z.string().min(1, "Selecciona una categoría"),
  videoUrl: z
    .string()
    .optional()
    .refine((v) => !v || isValidUrl(v), "URL de video inválida"),
});

export const setItemFormSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  price: z
    .string()
    .optional()
    .refine((v) => !v || parseFloat(v) > 0, "Debe ser mayor a 0"),
  comparePrice: z
    .string()
    .optional()
    .refine((v) => !v || parseFloat(v) > 0, "Debe ser mayor a 0"),
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
