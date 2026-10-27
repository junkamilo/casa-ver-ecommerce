import type { PosProduct } from "@/modules/posIntegration/contracts/pos-catalog.schema";
import { isPosCatalogConfigured, listProducts } from "@/modules/posIntegration/infrastructure/pos-catalog.client";

/** Variante del POS sin unidades (`out`) o en su mínimo de alerta (`low`), según publica la API pública. */
export type PosVariantAlert = {
  productSlug: string;
  productName: string;
  colorName: string;
  size: string;
  status: "out" | "low";
};

/**
 * Inventario del POS para las alertas del admin: la web ya no guarda stock (md/COMPARACION-TABLAS-INVENTARIO-
 * Y-PRODUCTOS-POS-vs-WEB.md). La API pública no da cantidades: por variante dice si hay unidades libres
 * (`available`, ya descontadas las reservas de pedidos web) y si está en su mínimo (`lowStock`).
 */
export async function listPosCatalogForAlerts(): Promise<PosProduct[]> {
  if (!isPosCatalogConfigured()) return [];
  return listProducts();
}

export function variantAlertsOf(products: PosProduct[]): PosVariantAlert[] {
  const alerts: PosVariantAlert[] = [];
  for (const product of products) {
    const colorName = new Map(product.colors.map((c) => [c.colorId, c.name]));
    const sizeName = new Map(product.sizes.map((s) => [s.sizeId, s.name]));
    for (const variant of product.variants) {
      if (variant.available && !variant.lowStock) continue;
      alerts.push({
        productSlug: product.slug,
        productName: product.name,
        colorName: colorName.get(variant.colorId) ?? "—",
        size: sizeName.get(variant.sizeId) ?? "—",
        status: variant.available ? "low" : "out",
      });
    }
  }
  // Primero lo agotado.
  return alerts.sort((a, b) => (a.status === b.status ? 0 : a.status === "out" ? -1 : 1));
}
