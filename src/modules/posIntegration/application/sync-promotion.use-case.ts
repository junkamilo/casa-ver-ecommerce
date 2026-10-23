import type { PosPromotion } from "../contracts/pos-catalog.schema";
import { mapPosPromotion } from "../domain/pos-promotion-mapper";
import { getPromotion } from "../infrastructure/pos-catalog.client";
import {
  PrismaPosPromotionRepository,
  type PosPromotionUpsertResult,
} from "../infrastructure/prisma-pos-promotion.repository";
import { PosSyncConflictError } from "../infrastructure/prisma-pos-sync.repository";

const repository = new PrismaPosPromotionRepository();

export type PosPromotionSyncResult =
  | ({ status: "upserted"; posPromotionId: string } & PosPromotionUpsertResult)
  | {
      status: "batch";
      posPromotionId: string;
      created: number;
      updated: number;
      removed: number;
      conflicts: string[];
    }
  | { status: "removed"; posPromotionId: string; outcome: "deactivated" | "deleted" | "missing" };

/**
 * Guarda una promoción ya descargada del POS. Código promocional → un cupón PROMOTIONAL `source = POS`.
 * Lote → un cupón BATCH_SINGLE por código, con su estado de uso. Sin canal WEB se retira. Alcance por
 * productos: se traduce a ids de la web (los que no existan aquí se omiten y se avisa). Alcance por
 * categorías: se guardan los webIds del POS.
 */
export async function upsertPosPromotion(pos: PosPromotion): Promise<PosPromotionSyncResult> {
  const mapped = mapPosPromotion(pos);
  if (!mapped.forWeb) return removePromotionById(mapped.posPromotionId);

  if (mapped.kind === "BATCH") {
    const saved = await repository.upsertBatch(mapped);
    if (saved.conflicts.length > 0) {
      // Los demás códigos del lote sí quedaron; el error deja constancia en el aviso o en el cron.
      throw new PosSyncConflictError(
        `Lote ${mapped.posPromotionId}: ${saved.conflicts.length} código(s) omitidos (${saved.conflicts.join("; ")})`,
      );
    }
    return { status: "batch", posPromotionId: mapped.posPromotionId, ...saved };
  }

  const productIds = await repository.findProductIdsByPosSlugs(mapped.scopeProductSlugs);
  if (productIds.length < mapped.scopeProductSlugs.length) {
    console.warn(
      `[POS promociones] ${mapped.posPromotionId}: ${mapped.scopeProductSlugs.length - productIds.length} producto(s) del alcance no existen en la web`,
    );
  }
  const saved = await repository.upsert(mapped, productIds);
  return { ...saved, status: "upserted", posPromotionId: mapped.posPromotionId };
}

/** Vuelve a consultar la promoción en el POS; si ya no es para la web (404), la retira. */
export async function syncPromotionById(posPromotionId: string): Promise<PosPromotionSyncResult> {
  const pos = await getPromotion(posPromotionId);
  if (!pos) return removePromotionById(posPromotionId);
  return upsertPosPromotion(pos);
}

export async function removePromotionById(posPromotionId: string): Promise<PosPromotionSyncResult> {
  const outcome = await repository.removeByPosPromotionId(posPromotionId);
  return { status: "removed", posPromotionId, outcome };
}

export async function listLocalPosPromotionIds(): Promise<string[]> {
  return repository.listPosPromotionIds();
}
