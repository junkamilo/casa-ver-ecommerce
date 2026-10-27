import { cache } from "react";
import { isPosCatalogConfigured } from "@/modules/posIntegration/infrastructure/pos-config";
import { fetchCatalogForRender } from "@/modules/posIntegration/infrastructure/pos-catalog.read";
import { getPosTaxonomy } from "@/modules/posIntegration/application/get-pos-taxonomy.use-case";
import { normalizePosSlug } from "@/modules/posIntegration/domain/pos-mapper";
import { PrismaProductWebSettingsRepository } from "@/modules/catalog/product/infrastructure/prisma-product-web-settings.repository";
import { posToCatalogEntry, sortByPublished, type CatalogEntry } from "../domain/catalog-entry.entity";

const webSettings = new PrismaProductWebSettingsRepository();

/**
 * Catálogo visible de la tienda, más nuevo primero: solo productos del POS (md/COMPARACION-TABLAS-INVENTARIO-Y-
 * PRODUCTOS-POS-vs-WEB.md). API del POS (Data Cache, tag `pos-products`) + capa web (`product_web_settings`),
 * ubicados en las categorías/subcategorías que publica el POS (tag `pos-categories`). La web ya no guarda
 * productos: si el POS no responde y la Data Cache no tiene copia, los listados quedan vacíos.
 * Memoizado por request: los bloques de una misma página comparten la lectura.
 */
export const getCatalog = cache(async (): Promise<CatalogEntry[]> => {
  if (!isPosCatalogConfigured()) return [];
  try {
    const [posProducts, settings, taxonomy] = await Promise.all([
      fetchCatalogForRender(),
      webSettings.findAll(),
      getPosTaxonomy(),
    ]);
    const seen = new Set<string>();
    return sortByPublished(
      posProducts
        .map((pos) => posToCatalogEntry(pos, settings.get(normalizePosSlug(pos.slug)) ?? null, taxonomy))
        .filter((e) => !seen.has(e.slug) && seen.add(e.slug)),
    );
  } catch (error) {
    console.error(
      "[catalog] POS sin respuesta para los listados:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
});

/** Productos que comparten categoría con `slug` (recomendados del PDP), más nuevos primero. */
export async function getRecommendedEntries(slug: string, take = 4): Promise<CatalogEntry[]> {
  const catalog = await getCatalog();
  const current = catalog.find((entry) => entry.slug === slug);
  if (!current || current.categorySlugs.length === 0) return [];
  const categories = new Set(current.categorySlugs);
  return catalog
    .filter((entry) => entry.slug !== slug && entry.categorySlugs.some((c) => categories.has(c)))
    .slice(0, take);
}
