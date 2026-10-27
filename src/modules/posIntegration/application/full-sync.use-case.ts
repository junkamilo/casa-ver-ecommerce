import { listProducts } from "../infrastructure/pos-catalog.client";
import { PrismaPosSyncRepository } from "../infrastructure/prisma-pos-sync.repository";
import { revalidateCatalogPages, revalidatePosCategories } from "./revalidate-catalog";
import { normalizePosSlug } from "../domain/pos-mapper";
import { upsertPosProduct } from "./sync-product.use-case";

const repository = new PrismaPosSyncRepository();

export type PosFullSyncResult = {
  products: { upserted: number; created: number; hidden: number; failed: number };
  errors: string[];
  durationMs: number;
};

/**
 * Respaldo de los avisos: descarga todos los productos visibles del POS, los guarda y oculta los que
 * tengan identificador del POS y ya no aparezcan. Las categorías no se copian (se leen del POS); solo
 * se expira su caché al final. Las promociones tampoco: el checkout valida cada cupón contra el POS.
 */
export async function runPosFullSync(): Promise<PosFullSyncResult> {
  const startedAt = Date.now();
  const errors: string[] = [];
  const result: PosFullSyncResult = {
    products: { upserted: 0, created: 0, hidden: 0, failed: 0 },
    errors,
    durationMs: 0,
  };

  const posProducts = await listProducts();
  const seenProductSlugs = new Set<string>();

  for (const product of posProducts) {
    seenProductSlugs.add(normalizePosSlug(product.slug));
    try {
      const saved = await upsertPosProduct(product);
      result.products.upserted++;
      if (saved.created) result.products.created++;
    } catch (error) {
      result.products.failed++;
      errors.push(`producto ${product.slug}: ${error instanceof Error ? error.message : error}`);
    }
  }

  // Si el POS devuelve un catálogo vacío es más probable una falla que un borrado masivo.
  if (posProducts.length > 0) {
    const localProducts = await repository.listActivePosProductSlugs();
    result.products.hidden = await repository.hideProductsByPosSlugs(
      localProducts.filter((slug) => !seenProductSlugs.has(normalizePosSlug(slug))),
    );
  } else {
    errors.push("El POS no devolvió productos; no se ocultó ninguno");
  }

  revalidateCatalogPages();
  revalidatePosCategories();
  result.durationMs = Date.now() - startedAt;
  return result;
}
