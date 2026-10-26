import { cache } from "react";
import type { PosProduct } from "@/modules/posIntegration/contracts/pos-catalog.schema";
import { isPosCatalogConfigured } from "@/modules/posIntegration/infrastructure/pos-config";
import { fetchProductForRender } from "@/modules/posIntegration/infrastructure/pos-catalog.read";
import { PrismaProductDetailRepository } from "../infrastructure/prisma-product-detail.repository";
import { PrismaProductWebSettingsRepository } from "../infrastructure/prisma-product-web-settings.repository";
import type { ProductWebOverlay } from "../domain/pos-product-detail.entity";

const repository = new PrismaProductDetailRepository();
const webSettings = new PrismaProductWebSettingsRepository();

export type ProductSource =
  | { source: "POS"; pos: PosProduct; overlay: ProductWebOverlay | null }
  | { source: "NEON_LEGACY" };

/**
 * De dónde se pinta un producto (ARQUITECTURA-DEFINITIVA-WEB.md §2.2):
 *   - Producto creado solo en la web (fila de Neon sin posSlug): con el POS integrado ya no se vende (404),
 *     porque su pedido no llegaría al POS; sin integración → Neon.
 *   - Producto del POS → API del POS (Data Cache, se purga por tag desde el webhook) + capa web
 *     (`product_web_settings`).
 *   - Si el POS no responde → su copia en Neon mientras exista, para no tumbar la página.
 * `null` = no existe (o el POS lo ocultó): la página responde 404.
 * Memoizado por request: `generateMetadata` y la página comparten la resolución.
 */
export const resolveProductSource = cache(async (slug: string): Promise<ProductSource | null> => {
  const [neon, overlay] = await Promise.all([repository.findNeonProduct(slug), webSettings.findBySlug(slug)]);
  if (!isPosCatalogConfigured()) return neon?.status === "ACTIVE" ? { source: "NEON_LEGACY" } : null;
  if (neon && !neon.posSlug) return null;

  try {
    const pos = await fetchProductForRender(slug);
    if (!pos) return null;
    return { source: "POS", pos, overlay };
  } catch (error) {
    console.warn(
      `[catalog] POS sin respuesta para /product/${slug}; se usa la copia en Neon:`,
      error instanceof Error ? error.message : error,
    );
    return neon?.status === "ACTIVE" ? { source: "NEON_LEGACY" } : null;
  }
});
