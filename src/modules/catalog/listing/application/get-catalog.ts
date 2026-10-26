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

/**
 * Catálogo desde Neon. `palette`: colores del POS (respaldo con el POS caído: solo la copia de sus productos);
 * `null` = tienda sin integración con el POS (todo Neon, sin restringir colores).
 */
async function catalogFromNeon(palette: PosColorPalette | null): Promise<CatalogEntry[]> {
  const rows = await repository.findActiveProducts(palette ? "POS_MIRROR" : "ALL");
  return rows.map((row) => neonToCatalogEntry(restrictWebRowColors(row, palette)));
}

/**
 * Catálogo visible de la tienda, más nuevo primero (ARQUITECTURA-DEFINITIVA-WEB.md, Fase 3):
 *   - Productos del POS: API del POS (Data Cache, tag `pos-products`) + capa web (`product_web_settings`),
 *     ubicados en las categorías/subcategorías que publica el POS (tag `pos-categories`).
 *   - Los productos creados solo en la web ya no se venden: todo pedido debe llegar al POS, que es quien lo
 *     despacha (md/COMPARACION-TABLAS-PEDIDOS-POS-vs-WEB.md). Para venderlos hay que crearlos en el POS.
 *   - Si el POS no responde: la copia en Neon de los productos del POS, para no dejar la tienda vacía.
 * Memoizado por request: los bloques de una misma página comparten la lectura.
 */
export const getCatalog = cache(async (): Promise<CatalogEntry[]> => {
  if (!isPosCatalogConfigured()) return sortByPublished(await catalogFromNeon(null));

  // Nunca lanza: si el POS cae sirve su último respaldo (o una paleta vacía).
  const palettePromise = getPosColorPalette();
  try {
    const [posProducts, settings, taxonomy] = await Promise.all([
      fetchCatalogForRender(),
      webSettings.findAll(),
      getPosTaxonomy(),
    ]);
    const entries = posProducts.map((pos) =>
      posToCatalogEntry(pos, settings.get(normalizePosSlug(pos.slug)) ?? null, taxonomy),
    );
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
