// ─────────────────────────────────────────────────────────────────────────────
// Thin re-export del use case `getShopProductsUseCase`.
//
// La lógica vive ahora en `src/modules/catalog/shop/`. Este archivo se mantiene
// para preservar la API pública (`getAllProducts(filters)`) consumida por
// `app/tienda/page.tsx`.
// ─────────────────────────────────────────────────────────────────────────────

import { getShopProductsUseCase } from "@/modules/catalog/shop/application/get-shop-products.use-case";
import type {
  TiendaFilters,
  ShopProductsResultDTO,
} from "@/modules/catalog/shop/contracts/shop.dto";

export async function getAllProducts(
  filters: TiendaFilters,
): Promise<ShopProductsResultDTO> {
  return getShopProductsUseCase(filters);
}
