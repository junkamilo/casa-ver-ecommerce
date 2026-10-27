import { cache } from "react";
import type { PosProduct } from "@/modules/posIntegration/contracts/pos-catalog.schema";
import { isPosCatalogConfigured } from "@/modules/posIntegration/infrastructure/pos-config";
import { fetchProductForRender } from "@/modules/posIntegration/infrastructure/pos-catalog.read";
import { PrismaProductWebSettingsRepository } from "../infrastructure/prisma-product-web-settings.repository";
import type { ProductWebOverlay } from "../domain/pos-product-detail.entity";

const webSettings = new PrismaProductWebSettingsRepository();

export type ProductSource = { source: "POS"; pos: PosProduct; overlay: ProductWebOverlay | null };

/**
 * Producto a pintar: API del POS (Data Cache, se purga por tag desde el webhook) + capa web
 * (`product_web_settings`). La web ya no guarda productos (md/COMPARACION-TABLAS-INVENTARIO-Y-PRODUCTOS-POS-vs-WEB.md).
 * `null` = no existe (o el POS lo ocultó): la página responde 404. Si el POS no responde se lanza (error
 * temporal, no 404, para no sacar el producto de los buscadores).
 * Memoizado por request: `generateMetadata` y la página comparten la resolución.
 */
export const resolveProductSource = cache(async (slug: string): Promise<ProductSource | null> => {
  if (!isPosCatalogConfigured()) return null;
  const [pos, overlay] = await Promise.all([fetchProductForRender(slug), webSettings.findBySlug(slug)]);
  if (!pos) return null;
  return { source: "POS", pos, overlay };
});
