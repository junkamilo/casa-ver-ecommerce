import { cache } from "react";
import { isPosCatalogConfigured } from "@/modules/posIntegration/infrastructure/pos-config";
import { fetchCatalogForRender } from "@/modules/posIntegration/infrastructure/pos-catalog.read";
import { getPosTaxonomy } from "@/modules/posIntegration/application/get-pos-taxonomy.use-case";
import { getPosColorPalette } from "@/modules/posIntegration/application/get-pos-colors.use-case";
import { normalizePosSlug } from "@/modules/posIntegration/domain/pos-mapper";
import { PrismaProductWebSettingsRepository } from "@/modules/catalog/product/infrastructure/prisma-product-web-settings.repository";
import { PrismaCatalogListingRepository } from "../infrastructure/prisma-catalog-listing.repository";
import {
  neonToCatalogEntry,
  posToCatalogEntry,
  restrictWebRowColors,
  sortByPublished,
  type CatalogEntry,
} from "../domain/catalog-entry.entity";
import type { PosColorPalette } from "@/modules/posIntegration/domain/pos-color-palette";

const repository = new PrismaCatalogListingRepository();
const webSettings = new PrismaProductWebSettingsRepository();

/** `palette`: colores del POS para los productos de la web; `null` = sin integración (no se restringe). */
async function catalogFromNeon(palette: PosColorPalette | null): Promise<CatalogEntry[]> {
  return (await repository.findActiveProducts(false)).map((row) => neonToCatalogEntry(restrictWebRowColors(row, palette)));
}

/**
 * Catálogo visible de la tienda, más nuevo primero (ARQUITECTURA-DEFINITIVA-WEB.md, Fase 3):
 *   - Productos del POS: API del POS (Data Cache, tag `pos-products`) + capa web (`product_web_settings`),
 *     ubicados en las categorías/subcategorías que publica el POS (tag `pos-categories`).
 *   - Productos creados en la web: Neon, con solo los colores que existen en el POS (tag `pos-colors`).
 *   - Si el POS no responde: la copia de Neon de todo el catálogo, para no dejar la tienda vacía.
 * Memoizado por request: los bloques de una misma página comparten la lectura.
 */
export const getCatalog = cache(async (): Promise<CatalogEntry[]> => {
  if (!isPosCatalogConfigured()) return sortByPublished(await catalogFromNeon(null));

  // Nunca lanza: si el POS cae sirve su último respaldo (o una paleta vacía).
  const palettePromise = getPosColorPalette();
  try {
    const [posProducts, settings, webProducts, taxonomy, palette] = await Promise.all([
      fetchCatalogForRender(),
      webSettings.findAll(),
      repository.findActiveProducts(true),
      getPosTaxonomy(),
      palettePromise,
    ]);
    const entries = [
      ...posProducts.map((pos) => posToCatalogEntry(pos, settings.get(normalizePosSlug(pos.slug)) ?? null, taxonomy)),
      ...webProducts.map((row) => neonToCatalogEntry(restrictWebRowColors(row, palette))),
    ];
    // Un slug no puede estar en ambos lados; si pasara, gana el del POS.
    const seen = new Set<string>();
    return sortByPublished(entries.filter((e) => !seen.has(e.slug) && seen.add(e.slug)));
  } catch (error) {
    console.warn(
      "[catalog] POS sin respuesta para los listados; se usa la copia en Neon:",
      error instanceof Error ? error.message : error,
    );
    return sortByPublished(await catalogFromNeon(await palettePromise));
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
