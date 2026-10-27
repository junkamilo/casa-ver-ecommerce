import { z } from "zod";

// Espejo de `PopupDtos.PublicPopupDto` del POS (GET /api/public/popups/active?placement=...).
// md/COMPARACION-TABLAS-POPUPS-POS-vs-WEB.md: los popups se crean y activan en el POS (Diseño → Popups).

export const POPUP_PLACEMENTS = ["HOME", "PRODUCT", "CHECKOUT"] as const;
export type PromoPopupPlacement = (typeof POPUP_PLACEMENTS)[number];

export const posActivePopupSchema = z.object({
  id: z.string().min(1),
  placement: z.enum(POPUP_PLACEMENTS),
  headline: z.string(),
  subtitle: z.string(),
  couponCode: z.string(),
  disclaimer: z.string(),
  ctaText: z.string(),
  ctaUrl: z.string(),
  delaySeconds: z.number().int().min(0).max(60),
  validTo: z.string().nullish(),
});

/** Popup vigente que pinta la tienda (lo que devuelve /api/promo-popups/active). */
export type ActivePromoPopupDTO = z.infer<typeof posActivePopupSchema>;
