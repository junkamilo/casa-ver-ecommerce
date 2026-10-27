import { listProducts } from "../infrastructure/pos-catalog.client";
import { normalizePosSlug } from "../domain/pos-mapper";
import { revalidateCatalogPages, revalidatePosCategories } from "./revalidate-catalog";
import { POS_PRODUCTS_CACHE_TAG } from "../infrastructure/pos-catalog.read";
import { revalidateTag } from "next/cache";
import { PrismaProductWebSettingsRepository } from "@/modules/catalog/product/infrastructure/prisma-product-web-settings.repository";

const webSettings = new PrismaProductWebSettingsRepository();

export type PosFullSyncResult = {
  products: { seen: number; registered: number; failed: number };
  errors: string[];
  durationMs: number;
};

/**
 * Respaldo diario de los avisos. La web ya no copia productos (los lee del POS): solo da de alta en la capa
 * web (`product_web_settings`, fecha que ordena los listados) los productos visibles que aún no tenía y expira
 * la caché de productos y categorías del POS para que el próximo render los vuelva a leer.
 */
export async function runPosFullSync(): Promise<PosFullSyncResult> {
  const startedAt = Date.now();
  const errors: string[] = [];
  const result: PosFullSyncResult = { products: { seen: 0, registered: 0, failed: 0 }, errors, durationMs: 0 };

  const posProducts = await listProducts();
  const known = await webSettings.findAll();
  result.products.seen = posProducts.length;

  for (const product of posProducts) {
    const slug = normalizePosSlug(product.slug);
    if (known.has(slug)) continue;
    try {
      await webSettings.ensure(slug);
      result.products.registered++;
    } catch (error) {
      result.products.failed++;
      errors.push(`producto ${product.slug}: ${error instanceof Error ? error.message : error}`);
    }
  }

  try {
    revalidateTag(POS_PRODUCTS_CACHE_TAG, { expire: 0 });
  } catch (error) {
    console.warn("[POS sync] No se pudo expirar la caché de productos:", error instanceof Error ? error.message : error);
  }
  revalidateCatalogPages();
  revalidatePosCategories();
  result.durationMs = Date.now() - startedAt;
  return result;
}
