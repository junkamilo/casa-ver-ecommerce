import type { Slide, HeroButton } from "../types";
import ImagenHeader1 from "@/assets/ImagenHeader1.jpg";
import ImagenHeader2 from "@/assets/ImagenHeader2.jpeg";

export const BRAND_GREEN = "#154734";
export const BRAND_GOLD  = "#C19A6B";

export const AUTOPLAY_TIME = 6000;

export const SLIDES: Slide[] = [
  {
    id: "01",
    image: ImagenHeader1,
    headline: "¡Bienvenida!",
    subheadline: "A tu nueva tienda web favorita",
  },
  {
    id: "02",
    image: ImagenHeader2,
  },
];

export const HERO_BUTTONS: HeroButton[] = [
  { label: "COMPRAR AHORA", href: "/tienda",      variant: "primary"   },
  { label: "CATEGORÍAS",    href: "/collections", variant: "secondary" },
];

// Gradientes extraídos como constantes para evitar re-creación en cada render
export const GRADIENT_DIAGONAL =
  "linear-gradient(120deg, rgba(10,35,24,0.88) 0%, rgba(21,71,52,0.50) 38%, rgba(21,71,52,0.08) 65%, transparent 100%)";

export const GRADIENT_BOTTOM =
  "linear-gradient(to top, rgba(8,28,20,0.75) 0%, rgba(10,35,24,0.35) 40%, transparent 100%)";

export const SHIMMER_PRIMARY =
  "linear-gradient(90deg, transparent 20%, rgba(193,154,107,0.22) 50%, transparent 80%)";

export const SHIMMER_SECONDARY =
  "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.28) 50%, transparent 80%)";
