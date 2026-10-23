import { listProducts, listPromotions } from "../infrastructure/pos-catalog.client";
import { PrismaPosSyncRepository } from "../infrastructure/prisma-pos-sync.repository";
import { revalidateCatalogPages, revalidatePosCategories } from "./revalidate-catalog";
import { normalizePosSlug } from "../domain/pos-mapper";
import { upsertPosProduct } from "./sync-product.use-case";
import { listLocalPosPromotionIds, removePromotionById, upsertPosPromotion } from "./sync-promotion.use-case";
import { syncShippingFromPos, type PosShippingSyncResult } from "./sync-shipping.use-case";
import { syncAdminsFromPos, type PosAdminSyncResult } from "./sync-admins.use-case";

const repository = new PrismaPosSyncRepository();

export type PosFullSyncResult = {
  products: { upserted: number; created: number; hidden: number; failed: number };
  promotions: { upserted: number; removed: number; failed: number };
  shipping: PosShippingSyncResult | null;
  admins: PosAdminSyncResult | null;
  errors: string[];
  durationMs: number;
};

/**
 * Respaldo de los avisos: descarga todos los productos visibles del POS, los guarda y oculta los que
 * tengan identificador del POS y ya no aparezcan. Las categorías no se copian (se leen del POS); solo
 * se expira su caché al final. Después hace lo
 * mismo con las promociones del canal WEB (cupones source = POS): las que ya no aparecen se retiran.
 */
export async function runPosFullSync(): Promise<PosFullSyncResult> {
  const startedAt = Date.now();
  const errors: string[] = [];
  const result: PosFullSyncResult = {
    products: { upserted: 0, created: 0, hidden: 0, failed: 0 },
    promotions: { upserted: 0, removed: 0, failed: 0 },
    shipping: null,
    admins: null,
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

  // Promociones: después de los productos, para que su alcance encuentre los productos ya sincronizados.
  try {
    await syncPromotions(result, errors);
  } catch (error) {
    errors.push(`promociones: ${error instanceof Error ? error.message : error}`);
  }

  // Envíos: independiente del catálogo; un fallo aquí no detiene lo demás.
  try {
    result.shipping = await syncShippingFromPos();
    if (result.shipping.status === "skipped") errors.push(`envíos: ${result.shipping.reason}`);
  } catch (error) {
    errors.push(`envíos: ${error instanceof Error ? error.message : error}`);
  }

  // Administradores de la web (Configuraciones → Usuarios del POS).
  try {
    result.admins = await syncAdminsFromPos();
    if (result.admins.status === "skipped") errors.push(`administradores: ${result.admins.reason}`);
    else if (result.admins.conflicts.length > 0) errors.push(...result.admins.conflicts.map((c) => `administradores: ${c}`));
  } catch (error) {
    errors.push(`administradores: ${error instanceof Error ? error.message : error}`);
  }

  revalidateCatalogPages();
  revalidatePosCategories();
  result.durationMs = Date.now() - startedAt;
  return result;
}

async function syncPromotions(result: PosFullSyncResult, errors: string[]) {
  const posPromotions = await listPromotions({ channel: "WEB" });
  if (posPromotions === null) {
    errors.push("El POS no publica promociones (sin endpoint); no se retiró ninguna");
    return;
  }
  const seen = new Set<string>();
  for (const promotion of posPromotions) {
    seen.add(promotion.promotionId);
    try {
      const saved = await upsertPosPromotion(promotion);
      if (saved.status === "removed") result.promotions.removed++;
      else result.promotions.upserted++;
    } catch (error) {
      result.promotions.failed++;
      errors.push(`promoción ${promotion.promotionId}: ${error instanceof Error ? error.message : error}`);
    }
  }
  for (const id of await listLocalPosPromotionIds()) {
    if (seen.has(id)) continue;
    await removePromotionById(id);
    result.promotions.removed++;
  }
}
