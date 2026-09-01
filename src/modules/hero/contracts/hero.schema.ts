import { z } from "zod";

const heroMediaTypeSchema = z.enum(["image", "video"]);

const focusPointSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  zoom: z.number().min(1).max(2.5).optional().default(1),
});

export const mediaFocusSchema = z.object({
  mobile: focusPointSchema,
  tablet: focusPointSchema,
  desktop: focusPointSchema,
});

const optionalHeadline = z
  .string()
  .trim()
  .max(120, "Máximo 120 caracteres")
  .optional()
  .nullable();

const optionalSubheadline = z
  .string()
  .trim()
  .max(200, "Máximo 200 caracteres")
  .optional()
  .nullable();

const optionalHeroMediaUrl = z
  .union([z.string().trim(), z.null()])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (v === null || v === "") return null;
    return v;
  });

const heroSlideBaseSchema = z.object({
  mediaUrl: z.string().trim().min(1, "URL de media requerida"),
  mediaUrlMobile: optionalHeroMediaUrl,
  mediaUrlTablet: optionalHeroMediaUrl,
  mediaType: heroMediaTypeSchema,
  headline: optionalHeadline,
  subheadline: optionalSubheadline,
  mediaFocus: mediaFocusSchema.optional(),
  playFullVideo: z.boolean().optional(),
});

export const createHeroSlideSchema = heroSlideBaseSchema;

export const updateHeroSlideSchema = z
  .object({
    id: z.string().trim().min(1, "id requerido"),
    mediaUrl: z.string().trim().min(1, "URL de media inválida").optional(),
    mediaUrlMobile: optionalHeroMediaUrl,
    mediaUrlTablet: optionalHeroMediaUrl,
    mediaType: heroMediaTypeSchema.optional(),
    headline: optionalHeadline,
    subheadline: optionalSubheadline,
    isActive: z.boolean().optional(),
    mediaFocus: mediaFocusSchema.optional(),
    playFullVideo: z.boolean().optional(),
  });

export const updateHeroSettingsSchema = z.object({
  slideDurationMs: z
    .number()
    .int()
    .min(2000, "Mínimo 2 segundos")
    .max(30000, "Máximo 30 segundos"),
});

export const MAX_HERO_SLIDES = 8;
