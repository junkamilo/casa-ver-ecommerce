import type { Prisma, PrismaClient } from "@prisma/client";
import { isProductInScope, isWholeOrder, type CouponScope } from "../domain/coupon-scope";
import { parsePosLineId } from "@/modules/posIntegration/domain/pos-mapper";
import { findProductsByKeys } from "@/lib/product-keys";

type Client = PrismaClient | Prisma.TransactionClient;

/**
 * Producto de Neon (espejo, por posSlug) de cada slug del POS. Los alcances de cupón y las categorías
 * aún guardan ids de Neon; cuando el catálogo deje de copiarse se guardarán slugs y webIds del POS.
 */
async function neonProductIdsBySlug(client: Client, slugs: string[]): Promise<Map<string, string>> {
  if (slugs.length === 0) return new Map();
  const rows = await client.product.findMany({
    where: { posSlug: { in: slugs, mode: "insensitive" } },
    select: { id: true, posSlug: true },
  });
  return new Map(rows.map((r) => [(r.posSlug as string).toLowerCase(), r.id]));
}

/**
 * Producto de Neon de cada ítem de un pedido o carrito (`productId` → id de Neon). `productId` es el slug
 * (o el id de Neon en pedidos anteriores a la migración); un ítem del POS también se encuentra por el
 * slug de su SKU. Sin espejo en Neon el ítem no aparece.
 */
export async function neonProductIdsOf(
  client: Client,
  items: { productId: string; variantId: string }[],
): Promise<Map<string, string>> {
  const posSlugOf = (variantId: string) => parsePosLineId(variantId)?.slug ?? null;
  const found = await findProductsByKeys(
    client,
    items.flatMap((item) => [item.productId, posSlugOf(item.variantId) ?? ""]),
  );
  const result = new Map<string, string>();
  for (const item of items) {
    const row = found.get(item.productId) ?? found.get(posSlugOf(item.variantId) ?? "");
    if (row) result.set(item.productId, row.id);
  }
  return result;
}

/**
 * Producto de cada variante del carrito: variante normal o pieza de un conjunto. Las variantes que
 * no existan quedan sin producto (no son elegibles para un cupón con alcance).
 */
export async function productIdsByVariant(client: Client, variantIds: string[]): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (variantIds.length === 0) return result;

  // Ítems del POS: el SKU trae el slug; el producto es su espejo en Neon.
  const slugByVariant = new Map<string, string>();
  for (const id of variantIds) {
    const ref = parsePosLineId(id);
    if (ref) slugByVariant.set(id, ref.slug);
  }
  const idBySlug = await neonProductIdsBySlug(client, [...new Set(slugByVariant.values())]);
  for (const [variantId, slug] of slugByVariant) {
    const productId = idBySlug.get(slug);
    if (productId) result.set(variantId, productId);
  }

  const neonVariantIds = variantIds.filter((id) => !slugByVariant.has(id));
  if (neonVariantIds.length === 0) return result;
  const variants = await client.productVariant.findMany({
    where: { id: { in: neonVariantIds } },
    select: { id: true, productId: true },
  });
  for (const v of variants) result.set(v.id, v.productId);
  const missing = neonVariantIds.filter((id) => !result.has(id));
  if (missing.length > 0) {
    const itemVariants = await client.productItemVariant.findMany({
      where: { id: { in: missing } },
      select: { id: true, color: { select: { item: { select: { productId: true } } } } },
    });
    for (const v of itemVariants) result.set(v.id, v.color.item.productId);
  }
  return result;
}

/**
 * Variantes del carrito a las que aplica el cupón. Sin alcance (todo el pedido) son todas.
 */
export async function eligibleVariantIds(
  client: Client,
  scope: CouponScope,
  variantIds: string[],
): Promise<Set<string>> {
  if (isWholeOrder(scope)) return new Set(variantIds);
  const productByVariant = await productIdsByVariant(client, variantIds);
  const productIds = [...new Set(productByVariant.values())];

  const categoriesByProduct = new Map<string, { id: string; parentId: string | null }[]>();
  if (scope.scopeType === "CATEGORIES" && productIds.length > 0) {
    const rows = await client.productCategory.findMany({
      where: { productId: { in: productIds } },
      select: { productId: true, category: { select: { id: true, parentId: true } } },
    });
    for (const row of rows) {
      const list = categoriesByProduct.get(row.productId) ?? [];
      list.push(row.category);
      categoriesByProduct.set(row.productId, list);
    }
  }

  const eligible = new Set<string>();
  for (const variantId of variantIds) {
    const productId = productByVariant.get(variantId) ?? null;
    if (isProductInScope(scope, productId, productId ? categoriesByProduct.get(productId) : [])) {
      eligible.add(variantId);
    }
  }
  return eligible;
}

/** Productos (de una lista) a los que aplica el cupón; para repartir el descuento al reportar al POS. */
export async function eligibleProductIds(client: Client, scope: CouponScope, productIds: string[]): Promise<Set<string>> {
  if (isWholeOrder(scope)) return new Set(productIds);
  if (scope.scopeType === "PRODUCTS") return new Set(productIds.filter((id) => scope.scopeProductIds.includes(id)));
  const rows = await client.productCategory.findMany({
    where: { productId: { in: productIds } },
    select: { productId: true, category: { select: { id: true, parentId: true } } },
  });
  const eligible = new Set<string>();
  for (const row of rows) {
    if (isProductInScope(scope, row.productId, [row.category])) eligible.add(row.productId);
  }
  return eligible;
}
