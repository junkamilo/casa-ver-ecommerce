import type { Prisma, PrismaClient } from "@prisma/client";
import { isProductInScope, isWholeOrder, type CouponScope } from "../domain/coupon-scope";
import { mapPosProduct, normalizePosSlug, parsePosLineId } from "@/modules/posIntegration/domain/pos-mapper";
import { fetchProductForRender } from "@/modules/posIntegration/infrastructure/pos-catalog.read";
import { findProductsByKeys } from "@/lib/product-keys";

type Client = PrismaClient | Prisma.TransactionClient;

/**
 * Producto de Neon (espejo, por posSlug) de cada slug del POS. El alcance por productos aún guarda ids
 * de Neon; el alcance por categorías ya guarda los webIds del POS (la web no guarda categorías).
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
 * Categorías y subcategorías del POS (webIds) donde está cada producto, leídas de la API del POS
 * (Data Cache por producto). Un producto que el POS no publica, o el POS sin responder, queda sin
 * categorías: no entra en un cupón con alcance por categorías.
 */
async function posCategoryWebIdsBySlug(slugs: string[]): Promise<Map<string, ScopeCategory[]>> {
  const result = new Map<string, ScopeCategory[]>();
  await Promise.all(
    [...new Set(slugs.map(normalizePosSlug))].map(async (slug) => {
      try {
        const pos = await fetchProductForRender(slug);
        if (pos) result.set(slug, mapPosProduct(pos).categoryWebIds.map((id) => ({ id, parentId: null })));
      } catch (error) {
        console.warn(
          `[cupones] POS sin respuesta para las categorías de ${slug}:`,
          error instanceof Error ? error.message : error,
        );
      }
    }),
  );
  return result;
}

type ScopeCategory = { id: string; parentId: string | null };

/** Categorías del POS de cada producto de Neon (los creados en la web no tienen posSlug ni categorías). */
async function categoriesByProductId(client: Client, productIds: string[]): Promise<Map<string, ScopeCategory[]>> {
  if (productIds.length === 0) return new Map();
  const rows = await client.product.findMany({
    where: { id: { in: productIds }, posSlug: { not: null } },
    select: { id: true, posSlug: true },
  });
  const webIdsBySlug = await posCategoryWebIdsBySlug(rows.map((r) => r.posSlug as string));
  return new Map(rows.map((r) => [r.id, webIdsBySlug.get(normalizePosSlug(r.posSlug as string)) ?? []]));
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
  const categoriesByProduct =
    scope.scopeType === "CATEGORIES" ? await categoriesByProductId(client, productIds) : new Map<string, ScopeCategory[]>();

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
  const categoriesByProduct = await categoriesByProductId(client, productIds);
  return new Set(productIds.filter((id) => isProductInScope(scope, id, categoriesByProduct.get(id) ?? [])));
}
