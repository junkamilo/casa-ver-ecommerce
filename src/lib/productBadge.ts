const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface ProductBadgeInput {
  isProductNew?: boolean;
  isProductNewAt?: Date | string | null;
  isOnSale?: boolean;
  stock?: number;
}

export type ProductBadgeLabel =
  | "Agotado"
  | "Nuevo Producto"
  | "En Oferta"
  | "Nuevo y en Oferta";

const BADGE_BASE_CLASS =
  "text-white text-[9px] font-black rounded-full uppercase tracking-[0.2em] shadow-md";

/**
 * Clases Tailwind para la etiqueta en tarjetas (paridad con admin + página de producto).
 */
export function getProductBadgeClassName(
  badge: string | undefined,
  options?: { compact?: boolean }
): string {
  const padding = options?.compact ? "px-2.5 py-1" : "px-3 py-1.5";
  const base = `${BADGE_BASE_CLASS} ${padding}`;

  switch (badge) {
    case "Nuevo Producto":
      return `${base} bg-red-600`;
    case "En Oferta":
      return `${base} bg-[#C19A6B]`;
    case "Nuevo y en Oferta":
      return `${base} bg-[#154734]`;
    case "Agotado":
      return `${base} bg-red-600`;
    default:
      return `${base} bg-gray-900`;
  }
}

/**
 * Calcula el badge a mostrar en la tarjeta de un producto.
 * - "Agotado"          → stock === 0
 * - "Nuevo Producto"   → isProductNew=true && isProductNewAt dentro de 7 días
 * - "En Oferta"        → isOnSale=true
 * - "Nuevo y en Oferta"→ ambas condiciones anteriores activas
 */
export function computeProductBadge(p: ProductBadgeInput): ProductBadgeLabel | undefined {
  if (p.stock === 0) return "Agotado";

  const isNewActive =
    p.isProductNew === true &&
    p.isProductNewAt != null &&
    Date.now() - new Date(p.isProductNewAt).getTime() < SEVEN_DAYS_MS;

  if (isNewActive && p.isOnSale) return "Nuevo y en Oferta";
  if (isNewActive) return "Nuevo Producto";
  if (p.isOnSale) return "En Oferta";
  return undefined;
}
