import { Truck } from "lucide-react";
import type { Announcement } from "../types";

/**
 * Anuncios estáticos de respaldo. El texto de envío gratis en la barra
 * se construye en runtime con las condiciones de envío gratis del POS (/api/shipping-config)
 * y el anuncio estacional activo del tema (/api/theme/active).
 */
export const ANNOUNCEMENTS: Announcement[] = [
  {
    text: "Envíos gratis por compras superiores a $300.000",
    icon: Truck,
  },
];
// Cuántas copias del marquee para garantizar loop sin saltos en pantallas ultra-anchas
export const MARQUEE_COPIES = 4;

// Factores de delay escalonado por índice de cada anuncio (en segundos)
export const DELAY_FACTORS = {
  float: 0.7,
  glow: 0.9,
  diamond: 0.5,
  diamondOffset: 0.4,
} as const;

export const STYLES = {
  barBackground: {
    backgroundImage:
      "linear-gradient(135deg, var(--theme-primary, #154734) 0%, color-mix(in srgb, var(--theme-primary, #154734) 84%, white) 40%, var(--theme-primary, #154734) 70%, color-mix(in srgb, var(--theme-primary, #154734) 82%, black) 100%)",
  },
  aurora: {
    backgroundImage:
      "radial-gradient(ellipse 60% 80% at 20% 50%, color-mix(in srgb, var(--theme-primary, #154734) 72%, white) 0%, transparent 70%), radial-gradient(ellipse 50% 70% at 80% 50%, color-mix(in srgb, var(--theme-primary, #154734) 75%, black) 0%, transparent 70%)",
  },
  shineSweep: {
    background:
      "linear-gradient(105deg, transparent 30%, rgba(193,154,107,0.18) 50%, transparent 70%)",
    filter: "blur(2px)",
  },
  iconGlow: {
    filter: "drop-shadow(0 0 5px rgba(193,154,107,0.7))",
  },
  textShadow: {
    textShadow: "0 0 20px rgba(193,154,107,0.15)",
  },
  diamond: {
    background: "var(--theme-accent, #C19A6B)",
    transform: "rotate(45deg)",
    boxShadow: "0 0 6px 1px rgba(193,154,107,0.6)",
  },
} as const;
