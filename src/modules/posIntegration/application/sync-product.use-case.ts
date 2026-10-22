import type { PosProduct } from "../contracts/pos-catalog.schema";
import { mapPosProduct, normalizePosSlug, type MappedPosProduct } from "../domain/pos-mapper";
import { getProduct } from "../infrastructure/pos-catalog.client";
import { PrismaPosSyncRepository } from "../infrastructure/prisma-pos-sync.repository";
import { revalidateCatalogPages } from "./revalidate-catalog";
import { syncPosCategories } from "./sync-pos-categories.use-case";
import { PrismaProductWebSettingsRepository } from "@/modules/catalog/product/infrastructure/prisma-product-web-settings.repository";

const repository = new PrismaPosSyncRepository();
const webSettings = new PrismaProductWebSettingsRepository();

/**
 * Categorías de la web donde va el producto: los espejos (por posWebId) de todas sus ubicaciones del
 * POS. Si falta alguno (categoría nueva en el POS) se refleja el árbol una vez y se vuelve a buscar.
 */
async function resolveCategoryIds(mapped: MappedPosProduct, categoriesSynced: boolean): Promise<string[]> {
  const wanted = mapped.categoryWebIds;
  if (wanted.length === 0) return [];

  let found = await repository.findCategoryIdsByPosWebIds(wanted);
  if (!categoriesSynced && wanted.some((id) => !found.has(id))) {
    await syncPosCategories();
    found = await repository.findCategoryIdsByPosWebIds(wanted);
  }
  return wanted.map((id) => found.get(id)).filter((id): id is string => Boolean(id));
}

/**
 * Guarda un producto ya descargado del POS. No revalida la caché.
 * `categoriesSynced`: el árbol de categorías ya se reflejó en esta corrida (sincronización completa).
 */
export async function upsertPosProduct(pos: PosProduct, options: { categoriesSynced?: boolean } = {}) {
  const mapped = mapPosProduct(pos);
  if (mapped.skipped.length > 0) {
    console.warn(`[POS sync] ${mapped.posSlug}: variantes omitidas -> ${mapped.skipped.join("; ")}`);
  }
  const categoryIds = await resolveCategoryIds(mapped, options.categoriesSynced ?? false);
  const garmentTypeIds = await repository.findGarmentTypeIdsBySlugs(mapped.garmentTypeSlugs);
  await webSettings.ensure(mapped.posSlug);
  return repository.upsertProduct(mapped, categoryIds, garmentTypeIds);
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
