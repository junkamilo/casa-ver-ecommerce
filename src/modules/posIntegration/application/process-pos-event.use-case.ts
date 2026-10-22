import type { PosWebhookPayload } from "../contracts/pos-catalog.schema";
import { revalidatePosCategories, revalidatePosProduct } from "./revalidate-catalog";
import { syncPosCategories } from "./sync-pos-categories.use-case";
import { removeProductBySlug, syncProductBySlug } from "./sync-product.use-case";
import { removePromotionById, syncPromotionById } from "./sync-promotion.use-case";
import { syncOrderStatusFromPos } from "./sync-order-status.use-case";
import { syncShippingFromPos } from "./sync-shipping.use-case";
import { syncAdminsFromPos } from "./sync-admins.use-case";
import { normalizePosSlug } from "../domain/pos-mapper";
import { PrismaProductWebSettingsRepository } from "@/modules/catalog/product/infrastructure/prisma-product-web-settings.repository";

const webSettings = new PrismaProductWebSettingsRepository();

/**
 * Aplica un aviso del POS. Productos: `upserted` y `stock_changed` vuelven a consultar el recurso
 * en la API (el aviso no trae datos) y `removed` lo oculta sin borrarlo. Promociones: `upserted`
 * vuelve a consultar la promoción y actualiza su cupón; `removed` la desactiva (con usos) o la borra.
 * Categorías y subcategorías: se vuelve a reflejar el árbol del POS (espejos por posWebId) y se expira
 * la caché del menú.
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

  await syncPosCategories();
  revalidatePosCategories();
  return { status: "revalidated" as const, entityType, id };
}
