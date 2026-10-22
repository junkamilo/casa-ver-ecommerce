import { invalidateShippingCache } from "@/modules/shipping/infrastructure/redis-shipping-cache";
import { countMunicipalities } from "../domain/pos-shipping-reconcile";
import { getShippingSnapshot } from "../infrastructure/pos-catalog.client";
import {
  PrismaPosShippingRepository,
  type PosShippingSyncCounts,
} from "../infrastructure/prisma-pos-shipping.repository";
import { PosSyncConflictError } from "../infrastructure/prisma-pos-sync.repository";

const repository = new PrismaPosShippingRepository();

export type PosShippingSyncResult =
  | ({ status: "synced" } & PosShippingSyncCounts)
  | { status: "skipped"; reason: string };

/**
 * Refleja en la web la foto de envíos del POS (fuente de verdad): tarifas, envío gratis y geografía
 * con la tarifa de cada municipio. Se usa con el aviso `shipping.upserted` y en el respaldo diario.
 */
export async function syncShippingFromPos(): Promise<PosShippingSyncResult> {
  const snapshot = await getShippingSnapshot();
  if (!snapshot) return { status: "skipped", reason: "El POS no publica envíos (sin endpoint)" };

  // Una geografía vacía es más probablemente una falla del POS que un borrado masivo.
  if (countMunicipalities(snapshot) === 0) {
    throw new PosSyncConflictError("El POS devolvió la geografía vacía; no se cambió nada en envíos");
  }

  const counts = await repository.applySnapshot(snapshot);
  await invalidateShippingCache();
  return { status: "synced", ...counts };
}
