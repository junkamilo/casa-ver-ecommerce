export const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "ONESIZE"] as const;

export function formatPrice(price: number): string {
  return `$${price.toLocaleString("es-CO")}`;
}
