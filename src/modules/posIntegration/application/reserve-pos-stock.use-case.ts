import type { PosOrderLine } from "../contracts/pos-catalog.schema";
import { normalizePosSlug, parsePosLineId, type PosLineRef } from "../domain/pos-mapper";
import { isPosCatalogConfigured, releasePosStock, reservePosStock } from "../infrastructure/pos-catalog.client";

export type PosAvailabilityIssue = {
  variantId: string;
  reason: "product_unavailable" | "out_of_stock";
  /** Mensaje del POS (p. ej. «solo quedan 2 unidades»). */
  message?: string;
};

/** El POS no respondió: no se puede apartar el inventario y el pedido no se crea. */
export class PosReservationUnavailableError extends Error {
  constructor(message = "No pudimos confirmar el inventario. Intenta de nuevo en unos segundos.") {
    super(message);
    this.name = "PosReservationUnavailableError";
  }
}

type CartItem = { variantId: string; quantity: number };

/** Una prenda del POS a reservar y las líneas del carrito que la piden. */
type PosReserveLine = PosLineRef & { variantIds: string[]; quantity: number };

const keyOf = (line: PosLineRef) => `${line.slug}:${line.colorId}:${line.sizeId}`;

/**
 * Antes de abrir la pasarela, aparta en el POS las unidades del carrito para este pedido (POST /orders/reserve):
 * mientras el cliente paga no se venden en la caja ni en otro pedido web. Todo o nada: si algo no alcanza no se
 * aparta nada y se devuelve qué falta. La reserva vence sola a los `minutes` y el pedido pagado la consume.
 * Solo se venden productos del POS: una línea sin SKU del POS (carrito viejo) se rechaza.
 */
export async function reservePosStockForOrder(
  orderNumber: string,
  items: CartItem[],
  minutes: number,
): Promise<PosAvailabilityIssue[]> {
  if (items.length === 0 || !isPosCatalogConfigured()) return [];

  const lines = new Map<string, PosReserveLine>();
  const issues: PosAvailabilityIssue[] = [];
  for (const item of items) {
    const ref = parsePosLineId(item.variantId);
    if (!ref) {
      issues.push({ variantId: item.variantId, reason: "product_unavailable" });
      continue;
    }
    const line = lines.get(keyOf(ref)) ?? { ...ref, variantIds: [], quantity: 0 };
    if (!line.variantIds.includes(item.variantId)) line.variantIds.push(item.variantId);
    line.quantity += item.quantity;
    lines.set(keyOf(ref), line);
  }
  if (issues.length > 0 || lines.size === 0) return issues;

  let reservation;
  try {
    reservation = await reservePosStock(
      orderNumber,
      [...lines.values()].map(
        (line): PosOrderLine => ({
          productSlug: line.slug,
          colorId: line.colorId,
          sizeId: line.sizeId,
          quantity: line.quantity,
          unitPrice: 0,
        }),
      ),
      minutes,
    );
  } catch (error) {
    console.error("[POS checkout] No se pudo reservar el inventario:", error instanceof Error ? error.message : error);
    throw new PosReservationUnavailableError();
  }
  if (reservation.reserved) return [];

  for (const problem of reservation.problems) {
    const affected = lines.get(
      keyOf({ slug: normalizePosSlug(problem.productSlug), colorId: problem.colorId, sizeId: problem.sizeId }),
    );
    const unknown = /no existe|no se vende|no está disponible/.test(problem.message ?? "");
    for (const variantId of affected?.variantIds ?? []) {
      issues.push({
        variantId,
        reason: unknown ? "product_unavailable" : "out_of_stock",
        message: problem.message ?? undefined,
      });
    }
  }
  // El POS dijo que no, aunque no identificó la línea: no se deja pasar.
  if (issues.length === 0) issues.push({ variantId: items[0].variantId, reason: "out_of_stock" });
  return issues;
}

/**
 * Suelta en el POS la reserva de un pedido que no se pagó (falló, se canceló o no se pudo crear). Mejor esfuerzo:
 * si el POS no responde, la reserva vence sola.
 */
export async function releasePosReservation(orderNumber: string): Promise<void> {
  if (!isPosCatalogConfigured()) return;
  try {
    await releasePosStock(orderNumber);
  } catch (error) {
    console.warn(
      `[POS checkout] No se pudo liberar la reserva de ${orderNumber} (vence sola):`,
      error instanceof Error ? error.message : error,
    );
  }
}
