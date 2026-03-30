const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface ProductBadgeInput {
  isProductNew?: boolean;
  isProductNewAt?: Date | string | null;
  isOnSale?: boolean;
  stock?: number;
}

/**
 * Calcula el badge a mostrar en la tarjeta de un producto.
 * - "Agotado"          → stock === 0
 * - "Nuevo Producto"   → isProductNew=true && isProductNewAt dentro de 7 días
 * - "En Oferta"        → isOnSale=true
 * - "Nuevo y en Oferta"→ ambas condiciones anteriores activas
 */
export function computeProductBadge(p: ProductBadgeInput): string | undefined {
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
