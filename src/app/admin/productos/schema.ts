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
  basePrice: z.coerce
    .number({ invalid_type_error: "El precio es requerido" })
    .positive("Debe ser mayor a 0"),
  comparePrice: z.coerce
    .number()
    .positive("Debe ser mayor a 0")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  stock: z.coerce
    .number({ invalid_type_error: "El stock es requerido" })
    .int("Debe ser un número entero")
    .min(0, "Stock mínimo 0"),
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
