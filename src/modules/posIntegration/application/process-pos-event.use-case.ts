import type { PosWebhookPayload } from "../contracts/pos-catalog.schema";
import { revalidatePosCategories, revalidatePosProduct } from "./revalidate-catalog";
import { removeProductBySlug, syncProductBySlug } from "./sync-product.use-case";
import { removePromotionById, syncPromotionById } from "./sync-promotion.use-case";
import { syncOrderStatusFromPos } from "./sync-order-status.use-case";
import { syncShippingFromPos } from "./sync-shipping.use-case";
import { syncAdminsFromPos } from "./sync-admins.use-case";
import { normalizePosSlug } from "../domain/pos-mapper";
import { collectionSlugsForWebId } from "../domain/pos-category-view";
import { getBackupCategoryTree } from "./get-pos-categories.use-case";
import { PrismaProductWebSettingsRepository } from "@/modules/catalog/product/infrastructure/prisma-product-web-settings.repository";

const webSettings = new PrismaProductWebSettingsRepository();

/**
 * Aplica un aviso del POS. Productos: `upserted` y `stock_changed` vuelven a consultar el recurso
 * en la API (el aviso no trae datos) y `removed` lo oculta sin borrarlo. Promociones: `upserted`
 * vuelve a consultar la promoción y actualiza su cupón; `removed` la desactiva (con usos) o la borra.
 * Categorías y subcategorías: la web no las guarda; se expira la caché del árbol del POS (menú,
 * colecciones y la ubicación de los productos) para que la próxima visita lo vuelva a leer.
 */
export async function processPosEvent(event: Pick<PosWebhookPayload, "entityType" | "id" | "action">) {
  const { entityType, id, action } = event;

  if (entityType === "product") {
    // id = slug del POS. La tienda lo lee del POS (purga por tag); la copia en Neon se mantiene hasta
    // la Fase 5. Un producto nuevo queda dado de alta en la capa web (fecha que ordena los listados).
    revalidatePosProduct(id);
    if (action !== "removed") await webSettings.ensure(normalizePosSlug(id));
    return action === "removed" ? removeProductBySlug(id) : syncProductBySlug(id);
  }

  if (entityType === "promotion") {
    return action === "removed" ? removePromotionById(id) : syncPromotionById(id);
  }

  // Pedidos: el POS cambió el estado logístico (Tienda → Pedidos); se consulta y se aplica en la web.
  if (entityType === "order") {
    return syncOrderStatusFromPos(id);
  }

  // Envíos: cambió una tarifa, el envío gratis o la geografía; se vuelve a copiar la foto completa.
  if (entityType === "shipping") {
    return syncShippingFromPos();
  }

  // Administradores: el POS cambió quién administra la web; se vuelve a copiar la lista.
  if (entityType === "admin") {
    return syncAdminsFromPos();
  }

  // Categoría o subcategoría (id = webId, el aviso no trae el slug): además del árbol se expiran las URLs
  // que tenía según la última copia (si cambió el slug, la nueva se lee fresca del POS en la próxima visita).
  const collectionSlugs = collectionSlugsForWebId(getBackupCategoryTree(), id);
  revalidatePosCategories(collectionSlugs);
  console.info(
    `[POS webhook] ${entityType}.${action} ${id}: tag pos-categories expirado` +
      (collectionSlugs.length ? `; rutas ${collectionSlugs.map((s) => `/collections/${s}`).join(", ")}` : ""),
  );
  return { status: "revalidated" as const, entityType, id, collectionSlugs };
}
