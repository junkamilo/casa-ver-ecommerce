import { prisma } from "@/lib/prisma";
import { findProductsByKeys } from "@/lib/product-keys";
import { buildPosOrderPayload, parsePosLineId } from "../domain/pos-mapper";
import { posPromotionIdOf } from "../domain/pos-promotion-mapper";
import { eligibleProductIds, neonProductIdsOf } from "@/modules/checkout/infrastructure/coupon-eligibility";
import { isPosCatalogConfigured, postOrder, postOrderCancellation } from "../infrastructure/pos-catalog.client";

export type ReportOrderToPosResult =
  | { status: "skipped"; reason: string }
  | { status: "registered"; saleNumber: string | null; replay: boolean }
  | { status: "rejected"; message: string };

export type ReportCancellationResult =
  | { status: "skipped"; reason: string }
  | { status: "cancelled"; posStatus: string; saleNumber: string | null; replay: boolean };

const REJECTED_TITLE = "Pedido sin registrar en el POS";
const PAID_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
const CANCELLED_STATUSES = ["CANCELLED", "REFUNDED"] as const;

type OrderLineIds = { productId: string; variantId: string };

/**
 * Productos del pedido que vienen del POS: productId → slug del POS. Un ítem con el SKU del POS como
 * `variantId` trae el slug en sí mismo; los demás se buscan en Neon (por slug o id) y cuentan si tienen posSlug.
 */
async function posSlugsOf(items: OrderLineIds[]): Promise<Map<string, string>> {
  const slugs = new Map<string, string>();
  const neonKeys = new Set<string>();
  for (const item of items) {
    const ref = parsePosLineId(item.variantId);
    if (ref) slugs.set(item.productId, ref.slug);
    else neonKeys.add(item.productId);
  }
  if (neonKeys.size === 0) return slugs;
  const products = await findProductsByKeys(prisma, [...neonKeys]);
  for (const key of neonKeys) {
    const posSlug = products.get(key)?.posSlug;
    if (posSlug) slugs.set(key, posSlug);
  }
  return slugs;
}

/** Productos del pedido (productId tal como está en el ítem) a los que aplica el cupón con alcance. */
async function couponEligibleProductIds(
  scope: Parameters<typeof eligibleProductIds>[1],
  items: OrderLineIds[],
): Promise<Set<string>> {
  const neonIdOf = await neonProductIdsOf(prisma, items);
  const eligible = await eligibleProductIds(prisma, scope, [...new Set(neonIdOf.values())]);
  return new Set(items.map((i) => i.productId).filter((id) => eligible.has(neonIdOf.get(id) ?? "")));
}

/**
 * Reporta un pedido pagado al POS para que lo registre como venta y descuente inventario (telas en
 * los compuestos). Solo viajan los ítems que vienen del POS, con el pago (pasarela, ids, fecha), el
 * cupón y el descuento y envío prorrateados. Es idempotente en el POS, así que el cron puede
 * reenviarlo. Si el POS lo rechaza (sin stock) se avisa al admin una vez para reembolsar al cliente.
 */
export async function reportPaidOrderToPos(orderId: string): Promise<ReportOrderToPosResult> {
  if (!isPosCatalogConfigured()) return { status: "skipped", reason: "POS no configurado" };

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: { select: { email: true } },
      appliedCoupon: {
        select: {
          code: true,
          source: true,
          posPromotionId: true,
          discountType: true,
          discountValue: true,
          scopeType: true,
          scopeProductIds: true,
          scopeCategoryIds: true,
        },
      },
    },
  });
  if (!order) return { status: "skipped", reason: "pedido inexistente" };
  if (!order.paidAt) return { status: "skipped", reason: "pedido sin pagar" };

  // Cupón con alcance: el descuento del POS es la parte de sus productos elegibles (no por subtotal).
  const coupon = order.appliedCoupon;
  const couponEligible = coupon
    ? await couponEligibleProductIds(
        {
          scopeType: coupon.scopeType,
          scopeProductIds: coupon.scopeProductIds ?? [],
          scopeCategoryIds: coupon.scopeCategoryIds ?? [],
        },
        order.items,
      )
    : null;

  const payload = buildPosOrderPayload(
    {
      orderNumber: order.orderNumber,
      shippingName: order.shippingName,
      shippingCedula: order.shippingCedula,
      shippingPhone: order.shippingPhone,
      shippingCity: order.shippingCity,
      shippingDepartment: order.shippingDepartment,
      shippingAddress: order.shippingAddress,
      email: order.user?.email ?? null,
      shippingCost: Number(order.shippingCost),
      discount: Number(order.discount),
      total: Number(order.total),
      couponCode: order.appliedCoupon?.code ?? null,
      coupon: coupon
        ? {
            code: coupon.code,
            source: coupon.source,
            // Lote: el cupón guarda "<promotionId>:<código>"; al POS va el promotionId y el código usado.
            posPromotionId: posPromotionIdOf(coupon.posPromotionId),
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            wholeOrder: coupon.scopeType === "ORDER",
            eligibleProductIds: couponEligible ?? new Set<string>(),
          }
        : null,
      payment: {
        method: order.paymentMethod,
        paymentId: order.paymentId,
        transactionId: order.transactionId,
        paidAt: order.paidAt,
      },
      items: order.items.map((i) => ({
        productId: i.productId,
        sku: i.sku,
        price: Number(i.price),
        quantity: i.quantity,
        name: i.name,
        colorName: i.colorName,
        size: i.size,
      })),
    },
    await posSlugsOf(order.items),
  );
  if (!payload) return { status: "skipped", reason: "sin productos del POS" };

  const outcome = await postOrder(payload);
  if (outcome.status === "registered") {
    return {
      status: "registered",
      saleNumber: outcome.result.saleNumber ?? null,
      replay: outcome.result.replay,
    };
  }

  console.error(`[POS orders] ${order.orderNumber} rechazado (${outcome.httpStatus}): ${outcome.message}`);
  const alreadyNotified = await prisma.adminNotification.findFirst({
    where: { orderId: order.id, title: { startsWith: REJECTED_TITLE } },
    select: { id: true },
  });
  if (!alreadyNotified) {
    await prisma.adminNotification.create({
      data: {
        orderId: order.id,
        title: `${REJECTED_TITLE} · ${order.orderNumber}`,
        body:
          `El POS no registró la venta: ${outcome.message}. El cliente ya pagó: reembolse en la pasarela ` +
          `y cancele el pedido.`,
      },
    });
  }
  return { status: "rejected", message: outcome.message };
}

/**
 * Avisa al POS que un pedido pagado se canceló o reembolsó: anula su venta y devuelve prendas, tela y
 * caja. Idempotente. Solo aplica a pedidos que se pagaron y tienen productos del POS.
 */
export async function reportOrderCancellationToPos(
  where: { id: string } | { orderNumber: string } | { transactionId: string },
  reason?: string,
): Promise<ReportCancellationResult> {
  if (!isPosCatalogConfigured()) return { status: "skipped", reason: "POS no configurado" };

  const order = await prisma.order.findFirst({
    where,
    select: { id: true, orderNumber: true, status: true, paidAt: true, items: { select: { productId: true, variantId: true } } },
  });
  if (!order) return { status: "skipped", reason: "pedido inexistente" };
  if (!order.paidAt) return { status: "skipped", reason: "nunca se pagó" };
  if (!(CANCELLED_STATUSES as readonly string[]).includes(order.status)) {
    return { status: "skipped", reason: `el pedido está ${order.status}` };
  }
  const slugs = await posSlugsOf(order.items);
  if (slugs.size === 0) return { status: "skipped", reason: "sin productos del POS" };

  const refunded = order.status === "REFUNDED";
  const result = await postOrderCancellation(order.orderNumber, {
    reason: reason ?? (refunded ? "Reembolsado en la tienda web" : "Cancelado en la tienda web"),
    refunded,
  });
  return { status: "cancelled", posStatus: result.status, saleNumber: result.saleNumber, replay: result.replay };
}

/** Pedidos pagados recientes (para reintentar desde el cron). */
export async function listRecentPaidOrderIds(days: number): Promise<string[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await prisma.order.findMany({
    where: { paidAt: { gte: since }, status: { in: [...PAID_STATUSES] } },
    select: { id: true },
    orderBy: { paidAt: "asc" },
  });
  return rows.map((r) => r.id);
}

/** Pedidos pagados que se cancelaron o reembolsaron en los últimos días (para reintentar la anulación). */
export async function listRecentCancelledPaidOrderIds(days: number): Promise<string[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await prisma.order.findMany({
    where: { paidAt: { not: null }, cancelledAt: { gte: since }, status: { in: [...CANCELLED_STATUSES] } },
    select: { id: true },
    orderBy: { cancelledAt: "asc" },
  });
  return rows.map((r) => r.id);
}
