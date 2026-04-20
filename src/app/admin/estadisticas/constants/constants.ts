import type { Period } from "../types/types";

// ── Etiquetas de período ──────────────────────────────────────────────────────

export const PERIOD_LABELS: Record<Period, string> = {
  day: "Hoy",
  week: "Esta Semana",
  month: "Este Mes",
};

// ── Colores para gráfico de categorías ───────────────────────────────────────

export const CATEGORY_COLORS = [
  "bg-[#154734]",
  "bg-[#C19A6B]",
  "bg-[#0f2e22]",
  "bg-[#e5d0b1]",
  "bg-gray-400",
] as const;

// ── Utilidades ────────────────────────────────────────────────────────────────

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
