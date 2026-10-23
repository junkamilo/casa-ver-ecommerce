import type { PosProduct } from "../contracts/pos-catalog.schema";
import { mapPosProduct, normalizePosSlug } from "../domain/pos-mapper";
import { getProduct } from "../infrastructure/pos-catalog.client";
import { PrismaPosSyncRepository } from "../infrastructure/prisma-pos-sync.repository";
import { revalidateCatalogPages } from "./revalidate-catalog";
import { PrismaProductWebSettingsRepository } from "@/modules/catalog/product/infrastructure/prisma-product-web-settings.repository";

const repository = new PrismaPosSyncRepository();
const webSettings = new PrismaProductWebSettingsRepository();

/**
 * Guarda la copia de respaldo de un producto ya descargado del POS. No revalida la caché. Sus
 * categorías no se copian: la tienda las lee del árbol del POS.
 */
export async function upsertPosProduct(pos: PosProduct) {
  const mapped = mapPosProduct(pos);
  if (mapped.skipped.length > 0) {
    console.warn(`[POS sync] ${mapped.posSlug}: variantes omitidas -> ${mapped.skipped.join("; ")}`);
  }
  await webSettings.ensure(mapped.posSlug);
  return repository.upsertProduct(mapped);
}

/** Vuelve a consultar el producto en el POS; si ya no es visible (404), lo oculta. */
export async function syncProductBySlug(
  slug: string,
  options: { revalidate?: boolean } = {},
): Promise<{ status: "upserted" | "removed"; slug: string | null }> {
  const pos = await getProduct(normalizePosSlug(slug));
  if (!pos) return removeProductBySlug(slug, options);

  const saved = await upsertPosProduct(pos);
  if (options.revalidate !== false) revalidateCatalogPages({ productSlugs: [saved.slug] });
  return { status: "upserted", slug: saved.slug };
}

export async function removeProductBySlug(
  slug: string,
  options: { revalidate?: boolean } = {},
): Promise<{ status: "removed"; slug: string | null }> {
  const hidden = await repository.hideProductByPosSlug(slug);
  if (hidden && options.revalidate !== false) revalidateCatalogPages({ productSlugs: [hidden.slug] });
  return { status: "removed", slug: hidden?.slug ?? null };
}
