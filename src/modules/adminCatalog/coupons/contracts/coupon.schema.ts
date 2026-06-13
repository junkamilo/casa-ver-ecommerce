import { z } from "zod";

export const generateCouponsSchema = z.object({
  discountPercentage: z.coerce
    .number()
    .int()
    .min(1, "El porcentaje debe ser al menos 1")
    .max(100, "El porcentaje no puede superar 100"),
  quantity: z.coerce
    .number()
    .int()
    .min(1, "Debes generar al menos 1 cupón")
    .max(100, "Máximo 100 cupones por lote"),
});

export const couponListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
});

export const deleteCouponSchema = z.object({
  id: z.string().min(1, "ID requerido"),
});

export const getCouponUsageSchema = z.object({
  id: z.string().min(1, "ID requerido"),
});
