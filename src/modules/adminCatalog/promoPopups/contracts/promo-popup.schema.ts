import { z } from "zod";
import { isDateBeforeTodayInBogota } from "@/modules/checkout/domain/coupon-schedule";

const placementSchema = z.enum(["HOME", "PRODUCT", "CHECKOUT"]);

const promoCodeSchema = z
  .string()
  .trim()
  .min(1, "El código es obligatorio")
  .max(30, "Máximo 30 caracteres")
  .transform((v) => v.toUpperCase());

const urlPathSchema = z
  .string()
  .trim()
  .min(1, "La URL es obligatoria")
  .refine(
    (v) => v.startsWith("/") || v.startsWith("http://") || v.startsWith("https://"),
    "La URL debe empezar con / o http(s)://"
  );

const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");
const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida");

const promoPopupBaseSchema = z.object({
  name: z.string().trim().min(1, "El nombre interno es obligatorio").max(80),
  placement: placementSchema,
  isActive: z.boolean().optional().default(false),
  headline: z.string().trim().min(1, "El título es obligatorio").max(80),
  subtitle: z.string().trim().min(1, "El subtítulo es obligatorio").max(120),
  couponCode: promoCodeSchema,
  disclaimer: z.string().trim().min(1, "El texto legal es obligatorio").max(200),
  ctaText: z.string().trim().min(1, "El texto del botón es obligatorio").max(40),
  ctaUrl: urlPathSchema.default("/tienda"),
  delaySeconds: z.coerce
    .number()
    .int()
    .min(0, "El retraso no puede ser negativo")
    .max(60, "Máximo 60 segundos"),
  scheduleEnabled: z.boolean().default(false),
  scheduleMode: z.enum(["SINGLE_DAY", "DATE_RANGE"]).optional(),
  singleDayDate: dateOnlySchema.optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  fromDate: dateOnlySchema.optional(),
  toDate: dateOnlySchema.optional(),
});

function refineSchedule(data: z.infer<typeof promoPopupBaseSchema>, ctx: z.RefinementCtx) {
  if (!data.scheduleEnabled) return;

  if (!data.scheduleMode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Selecciona el tipo de vigencia",
      path: ["scheduleMode"],
    });
    return;
  }

  if (data.scheduleMode === "SINGLE_DAY") {
    if (!data.singleDayDate || !data.startTime || !data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Fecha y horas son obligatorias para un día específico",
        path: ["singleDayDate"],
      });
      return;
    }
    if (isDateBeforeTodayInBogota(data.singleDayDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha no puede ser anterior a hoy",
        path: ["singleDayDate"],
      });
    }
    if (data.startTime >= data.endTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La hora de fin debe ser posterior a la de inicio",
        path: ["endTime"],
      });
    }
  }

  if (data.scheduleMode === "DATE_RANGE") {
    if (!data.fromDate || !data.toDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las fechas de inicio y fin son obligatorias",
        path: ["fromDate"],
      });
      return;
    }
    if (isDateBeforeTodayInBogota(data.toDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de fin no puede ser anterior a hoy",
        path: ["toDate"],
      });
    }
    if (data.fromDate > data.toDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La fecha de fin debe ser posterior o igual a la de inicio",
        path: ["toDate"],
      });
    }
  }
}

export const createPromoPopupSchema = promoPopupBaseSchema.superRefine(refineSchedule);

export const updatePromoPopupSchema = promoPopupBaseSchema
  .extend({
    id: z.string().min(1, "ID requerido"),
  })
  .superRefine(refineSchedule);

export const togglePromoPopupSchema = z.object({
  id: z.string().min(1, "ID requerido"),
  isActive: z.boolean(),
});

export const deletePromoPopupSchema = z.object({
  id: z.string().min(1, "ID requerido"),
});

export const activePromoPopupQuerySchema = z.object({
  placement: placementSchema,
});
