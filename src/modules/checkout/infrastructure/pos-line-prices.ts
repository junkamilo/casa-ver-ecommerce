import { prisma } from "@/lib/prisma";
import { parsePosLineId, type PosLineRef } from "@/modules/posIntegration/domain/pos-mapper";
import { getProduct } from "@/modules/posIntegration/infrastructure/pos-catalog.client";
import { ProductUnavailableError, VariantNotFoundError } from "../application/checkout.errors";

type Line = { variantId: string; name: string };

/**
 * Precio real de los ítems del POS (`variantId` = SKU del POS), consultado al POS. Se llama ANTES del
 * $transaction para no retener la conexión mientras responde. Si el POS no responde se usa el espejo
 * de Neon mientras exista. Los ítems con id de Neon no se incluyen: los resuelve el checkout como siempre.
 */
export async function resolvePosLinePrices(items: Line[]): Promise<Map<string, number>> {
  const bySlug = new Map<string, { item: Line; ref: PosLineRef }[]>();
  for (const item of items) {
    const ref = parsePosLineId(item.variantId);
    if (ref) bySlug.set(ref.slug, [...(bySlug.get(ref.slug) ?? []), { item, ref }]);
  }

  const prices = new Map<string, number>();
  await Promise.all(
    [...bySlug.entries()].map(async ([slug, lines]) => {
      let pos;
      try {
        pos = await getProduct(slug);
      } catch (error) {
        console.warn(`[checkout] POS sin respuesta para ${slug}; se usa el espejo local:`, error);
        for (const { item } of lines) prices.set(item.variantId, await mirrorPrice(item));
        return;
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

async function mirrorPrice(item: Line): Promise<number> {
  const variant = await prisma.productVariant.findUnique({
    where: { sku: item.variantId },
    select: { isActive: true, priceOverride: true, product: { select: { basePrice: true } } },
  });
  if (!variant) throw new VariantNotFoundError(`Variante ${item.variantId} no encontrada`);
  if (!variant.isActive) throw new ProductUnavailableError(`El producto "${item.name}" ya no está disponible`);
  return Number(variant.priceOverride ?? variant.product.basePrice);
}
