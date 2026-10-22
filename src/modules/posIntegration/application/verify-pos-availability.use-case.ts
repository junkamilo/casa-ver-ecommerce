import type { PosOrderLine } from "../contracts/pos-catalog.schema";
import { normalizePosSlug, parsePosLineId, parsePosVariantSku, type PosLineRef } from "../domain/pos-mapper";
import { checkPosStock, getProduct, isPosCatalogConfigured } from "../infrastructure/pos-catalog.client";
import { PrismaPosSyncRepository } from "../infrastructure/prisma-pos-sync.repository";
import { upsertPosProduct } from "./sync-product.use-case";

const repository = new PrismaPosSyncRepository();

export type PosAvailabilityIssue = {
  variantId: string;
  reason: "product_unavailable" | "out_of_stock";
  /** Mensaje del POS (p. ej. «solo quedan 2 unidades»). */
  message?: string;
};

type CartItem = { variantId: string; quantity: number };

/** Una prenda del POS a verificar y las variantes del carrito que la piden. */
type PosCheckLine = PosLineRef & { variantIds: string[]; quantity: number };

const keyOf = (line: PosLineRef) => `${line.slug}:${line.colorId}:${line.sizeId}`;

/**
 * Prendas del POS del carrito. Acepta los dos formatos de `variantId`: el SKU del POS
 * (`pos-<slug>-<colorId>-<sizeId>`) se lee directo; un id de Neon se traduce con su espejo.
 * Los productos de la web (sin posSlug) no se verifican aquí.
 */
async function resolvePosLines(quantities: Map<string, number>): Promise<Map<string, PosCheckLine>> {
  const refs = new Map<string, PosLineRef>();
  const neonIds: string[] = [];
  for (const variantId of quantities.keys()) {
    const ref = parsePosLineId(variantId);
    if (ref) refs.set(variantId, ref);
    else neonIds.push(variantId);
  }

  for (const variant of await repository.findVariantsForAvailabilityCheck(neonIds)) {
    const combo = parsePosVariantSku(variant.sku);
    if (combo) refs.set(variant.id, { slug: normalizePosSlug(variant.product.posSlug as string), ...combo });
  }

  const lines = new Map<string, PosCheckLine>();
  for (const [variantId, ref] of refs) {
    const key = keyOf(ref);
    const line = lines.get(key) ?? { ...ref, variantIds: [], quantity: 0 };
    line.variantIds.push(variantId);
    line.quantity += quantities.get(variantId) ?? 1;
    lines.set(key, line);
  }
  return lines;
}

/**
 * Antes de crear el pedido, pregunta al POS si alcanza el inventario para las CANTIDADES del carrito
 * (POST /orders/check: stock de la variante, tela de la receta en compuestos). Así la web no deja
 * pagar lo que el POS ya no tiene. Si el POS no responde se usa la disponibilidad publicada y, si
 * tampoco, la copia local para no bloquear las ventas.
 */
export async function verifyPosAvailability(items: CartItem[]): Promise<PosAvailabilityIssue[]> {
  if (items.length === 0 || !isPosCatalogConfigured()) return [];

  const quantities = new Map<string, number>();
  for (const item of items) quantities.set(item.variantId, (quantities.get(item.variantId) ?? 0) + item.quantity);

  const lines = await resolvePosLines(quantities);
  if (lines.size === 0) return [];

  try {
    const check = await checkPosStock(
      [...lines.values()].map(
        (line): PosOrderLine => ({
          productSlug: line.slug,
          colorId: line.colorId,
          sizeId: line.sizeId,
          quantity: line.quantity,
          unitPrice: 0,
        }),
      ),
    );
    const issues: PosAvailabilityIssue[] = [];
    const staleSlugs = new Set<string>();
    for (const problem of check.problems) {
      const slug = normalizePosSlug(problem.productSlug);
      const affected = lines.get(keyOf({ slug, colorId: problem.colorId, sizeId: problem.sizeId }));
      const unknown = (problem.message ?? "").includes("no existe");
      for (const variantId of affected?.variantIds ?? []) {
        issues.push({
          variantId,
          reason: unknown ? "product_unavailable" : "out_of_stock",
          message: problem.message ?? undefined,
        });
      }
      staleSlugs.add(slug);
    }
    // La copia local iba atrasada: se refresca para que la tienda deje de ofrecerlo.
    for (const slug of staleSlugs) void refreshProduct(slug);
    return issues;
  } catch (error) {
    console.warn(
      "[POS checkout] No se pudo verificar el stock exacto; se usa la disponibilidad publicada:",
      error instanceof Error ? error.message : error,
    );
  }

  return verifyPublishedAvailability([...lines.values()]);
}

async function refreshProduct(slug: string) {
  try {
    const pos = await getProduct(slug);
    if (pos) await upsertPosProduct(pos);
    else await repository.hideProductByPosSlug(slug);
  } catch {
    // Se corrige en el próximo aviso o en la sincronización diaria.
  }
}

/**
 * Respaldo: consulta el producto publicado (disponible / agotado por variante). Si el POS no responde
 * se confía en el espejo local para no bloquear las ventas.
 */
async function verifyPublishedAvailability(lines: PosCheckLine[]): Promise<PosAvailabilityIssue[]> {
  const bySlug = new Map<string, PosCheckLine[]>();
  for (const line of lines) bySlug.set(line.slug, [...(bySlug.get(line.slug) ?? []), line]);

  const issues: PosAvailabilityIssue[] = [];

  await Promise.all(
    [...bySlug.entries()].map(async ([slug, slugLines]) => {
      let pos;
      try {
        pos = await getProduct(slug);
      } catch (error) {
        console.warn(`[POS checkout] No se pudo verificar ${slug}; se usa el espejo local:`, error);
        return;
      }

      if (!pos) {
        for (const line of slugLines) {
          line.variantIds.forEach((variantId) => issues.push({ variantId, reason: "product_unavailable" }));
        }
        void repository.hideProductByPosSlug(slug).catch(() => undefined);
        return;
      }

      let stale = false;
      for (const line of slugLines) {
        const fresh = pos.variants.find((v) => v.colorId === line.colorId && v.sizeId === line.sizeId);
        if (!fresh?.available) {
          line.variantIds.forEach((variantId) => issues.push({ variantId, reason: "out_of_stock" }));
          stale = true;
        }
      }
      if (stale) void upsertPosProduct(pos).catch(() => undefined);
    }),
  );

  return issues;
}
