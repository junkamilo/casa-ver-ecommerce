import { z } from "zod";

import { isDateBeforeTodayInBogota } from "@/modules/checkout/domain/coupon-schedule";



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



const promotionalCustomCodeSchema = z

  .string()

  .trim()

  .transform((v) => v.toUpperCase())

  .pipe(z.string().regex(/^[A-Z0-9-]{4,20}$/, "Nombre inválido (4-20 caracteres alfanuméricos)"));



const dateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida");



export const createPromotionalCouponSchema = z

  .object({

    codeSource: z.enum(["RANDOM", "CUSTOM"], {
      message: "Debes elegir cómo se genera el código",
    }),

    code: promotionalCustomCodeSchema.optional(),

    discountType: z.enum(["PERCENTAGE", "FIXED"]),

    discountValue: z.coerce.number().int().positive(),

    maxGlobalUses: z.coerce.number().int().min(1).max(10000),

    scheduleEnabled: z.boolean().default(false),

    scheduleMode: z.enum(["SINGLE_DAY", "DATE_RANGE"]).optional(),

    singleDayDate: dateOnlySchema.optional(),

    startTime: timeSchema.optional(),

    endTime: timeSchema.optional(),

    fromDate: dateOnlySchema.optional(),

    toDate: dateOnlySchema.optional(),

  })

  .superRefine((data, ctx) => {

    if (data.codeSource === "CUSTOM") {

      if (!data.code) {

        ctx.addIssue({

          code: z.ZodIssueCode.custom,

          message: "Ingresa el nombre personalizado del cupón",

          path: ["code"],

        });

      }

    } else if (data.code) {

      ctx.addIssue({

        code: z.ZodIssueCode.custom,

        message: "No envíes código cuando eliges generación aleatoria",

        path: ["code"],

      });

    }



    if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {

      ctx.addIssue({

        code: z.ZodIssueCode.custom,

        message: "El porcentaje no puede superar 100",

        path: ["discountValue"],

      });

    }

    if (data.discountType === "FIXED" && data.discountValue > 5_000_000) {

      ctx.addIssue({

        code: z.ZodIssueCode.custom,

        message: "El descuento fijo no puede superar $5.000.000",

        path: ["discountValue"],

      });

    }



    if (!data.scheduleEnabled) return;



    if (!data.scheduleMode) {

      ctx.addIssue({

        code: z.ZodIssueCode.custom,

        message: "Elige el tipo de vigencia",

        path: ["scheduleMode"],

      });

      return;

    }



    if (data.scheduleMode === "SINGLE_DAY") {

      if (!data.singleDayDate) {

        ctx.addIssue({

          code: z.ZodIssueCode.custom,

          message: "Selecciona el día",

          path: ["singleDayDate"],

        });

      } else if (isDateBeforeTodayInBogota(data.singleDayDate)) {

        ctx.addIssue({

          code: z.ZodIssueCode.custom,

          message: "La fecha no puede ser anterior a hoy",

          path: ["singleDayDate"],

        });

      }

      if (!data.startTime) {

        ctx.addIssue({

          code: z.ZodIssueCode.custom,

          message: "Ingresa la hora de inicio",

          path: ["startTime"],

        });

      }

      if (!data.endTime) {

        ctx.addIssue({

          code: z.ZodIssueCode.custom,

          message: "Ingresa la hora de fin",

          path: ["endTime"],

        });

      }

      if (data.startTime && data.endTime && data.endTime <= data.startTime) {

        ctx.addIssue({

          code: z.ZodIssueCode.custom,

          message: "La hora de fin debe ser posterior a la de inicio",

          path: ["endTime"],

        });

      }

      if (data.fromDate || data.toDate) {

        ctx.addIssue({

          code: z.ZodIssueCode.custom,

          message: "No uses rango de fechas en modo día específico",

          path: ["fromDate"],

        });

      }

      return;

    }



    if (data.scheduleMode === "DATE_RANGE") {

      if (!data.fromDate) {

        ctx.addIssue({

          code: z.ZodIssueCode.custom,

          message: "Selecciona la fecha de inicio",

          path: ["fromDate"],

        });

      } else if (isDateBeforeTodayInBogota(data.fromDate)) {

        ctx.addIssue({

          code: z.ZodIssueCode.custom,

          message: "La fecha de inicio no puede ser anterior a hoy",

          path: ["fromDate"],

        });

      }

      if (!data.toDate) {

        ctx.addIssue({

          code: z.ZodIssueCode.custom,

          message: "Selecciona la fecha de fin",

          path: ["toDate"],

        });

      }

      if (data.fromDate && data.toDate && data.toDate < data.fromDate) {

        ctx.addIssue({

          code: z.ZodIssueCode.custom,

          message: "La fecha de fin debe ser igual o posterior a la de inicio",

          path: ["toDate"],

        });

      }

      if (data.singleDayDate || data.startTime || data.endTime) {

        ctx.addIssue({

          code: z.ZodIssueCode.custom,

          message: "No uses horas en modo rango de fechas",

          path: ["startTime"],

        });

      }

    }

  });



export const promotionalCouponListQuerySchema = couponListQuerySchema;



export const promotionalCouponIdSchema = z.object({

  id: z.string().min(1, "ID requerido"),

});


