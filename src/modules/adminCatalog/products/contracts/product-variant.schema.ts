import { z } from "zod";

export const updateProductVariantStockSchema = z.object({
  stock: z
    .number()
    .int("Stock debe ser un entero entre 0 y 999999")
    .min(0, "Stock debe ser un entero entre 0 y 999999")
    .max(999_999, "Stock debe ser un entero entre 0 y 999999"),
});
