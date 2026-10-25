import { findPaletteColor, type PosColorPalette } from "@/modules/posIntegration/domain/pos-color-palette";
import { ProductUnavailableError } from "../application/checkout.errors";

/**
 * Un producto creado en la web solo se vende en los colores que existen en el POS: la tienda ya no muestra
 * los demás y el pedido no puede traerlos (carrito viejo o petición manual). La copia de un producto del POS
 * (`posSlug`) trae colores del POS y no se revisa; `palette = null` = sin integración con el POS.
 */
export function assertWebColorSellable(
  palette: PosColorPalette | null,
  variant: { posSlug: string | null | undefined; colorName: string | null | undefined },
  itemName: string,
): void {
  if (!palette || variant.posSlug) return;
  const colorName = variant.colorName ?? "";
  if (!findPaletteColor(palette, colorName)) {
    throw new ProductUnavailableError(`El color "${colorName}" de "${itemName}" ya no está disponible`);
  }
}
