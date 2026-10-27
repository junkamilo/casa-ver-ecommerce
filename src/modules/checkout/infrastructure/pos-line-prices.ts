import { parsePosLineId, type PosLineRef } from "@/modules/posIntegration/domain/pos-mapper";
import { getProduct } from "@/modules/posIntegration/infrastructure/pos-catalog.client";
import { PosUnavailableError, ProductUnavailableError, VariantNotFoundError } from "../application/checkout.errors";

type Line = { variantId: string; name: string };

/**
 * Precio real de cada ítem (`variantId` = SKU del POS), consultado al POS. Se llama ANTES del $transaction
 * para no retener la conexión mientras responde. Solo se venden productos del POS: un ítem sin SKU del POS
 * (carrito guardado antes de la migración) se rechaza, y si el POS no responde el pedido no se crea.
 */
export async function resolvePosLinePrices(items: Line[]): Promise<Map<string, number>> {
  const bySlug = new Map<string, { item: Line; ref: PosLineRef }[]>();
  for (const item of items) {
    const ref = parsePosLineId(item.variantId);
    if (!ref) throw new ProductUnavailableError(`El producto "${item.name}" ya no está disponible`);
    bySlug.set(ref.slug, [...(bySlug.get(ref.slug) ?? []), { item, ref }]);
  }

  const prices = new Map<string, number>();
  await Promise.all(
    [...bySlug.entries()].map(async ([slug, lines]) => {
      let pos;
      try {
        pos = await getProduct(slug);
      } catch (error) {
        console.error(`[checkout] POS sin respuesta para ${slug}:`, error);
        throw new PosUnavailableError("No pudimos confirmar los precios. Intenta de nuevo en unos segundos.");
      }

      for (const { item, ref } of lines) {
        if (!pos) throw new ProductUnavailableError(`El producto "${item.name}" ya no está disponible`);
        if (!pos.variants.some((v) => v.colorId === ref.colorId && v.sizeId === ref.sizeId)) {
          throw new VariantNotFoundError(`Variante ${item.variantId} no encontrada`);
        }
        prices.set(item.variantId, pos.salePrice);
      }
    }),
  );
  return prices;
}
