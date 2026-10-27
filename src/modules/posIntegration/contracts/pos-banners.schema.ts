import { z } from "zod";

// Espejo de `BannerDtos.PublicHeroDto` del POS (GET /api/public/banners).
// md/COMPARACION-TABLAS-BANNERS-POS-vs-WEB.md: el carrusel del inicio se administra en el POS (Diseño → Banners).

const focusPointSchema = z.object({ x: z.number(), y: z.number(), zoom: z.number() });

export const posHeroSlideSchema = z.object({
  id: z.string().min(1),
  position: z.number().int(),
  mediaUrl: z.string(),
  mediaUrlMobile: z.string().nullish(),
  mediaUrlTablet: z.string().nullish(),
  posterUrl: z.string().nullish(),
  mediaType: z.enum(["image", "video"]).catch("image"),
  headline: z.string().nullish(),
  subheadline: z.string().nullish(),
  mediaFocus: z.record(z.string(), focusPointSchema).nullish(),
  playFullVideo: z.boolean().default(false),
  linkUrl: z.string().nullish(),
});

export const posHeroSchema = z.object({
  slideDurationMs: z.number().int().positive(),
  slides: z.array(posHeroSlideSchema).default([]),
});

export type PosHeroSlide = z.infer<typeof posHeroSlideSchema>;
export type PosHero = z.infer<typeof posHeroSchema>;
