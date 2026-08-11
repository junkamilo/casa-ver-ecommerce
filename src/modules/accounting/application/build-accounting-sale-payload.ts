import { prisma } from "@/lib/prisma";
import type { AccountingSalePayloadDTO } from "../contracts/accounting-sale.dto";

const EXPORTABLE_STATUSES = [
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "REFUNDED",
] as const;

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof value === "object" && "toNumber" in value) {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

/**
 * Arma el payload contable { order, items } desde un pedido existente.
 * Retorna null si el pedido no existe o no está en estado exportable.
 */
export async function buildAccountingSalePayload(
  orderId: string,
): Promise<AccountingSalePayloadDTO | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { orderBy: { id: "asc" } },
      appliedCoupon: { select: { code: true } },
    },
  });

  if (!order) return null;
  if (
    !EXPORTABLE_STATUSES.includes(
      order.status as (typeof EXPORTABLE_STATUSES)[number],
    )
  ) {
    return null;
  }

  const productIds = [...new Set(order.items.map((i) => i.productId))];
  const categoryLinks =
    productIds.length > 0
      ? await prisma.productCategory.findMany({
          where: { productId: { in: productIds } },
          select: {
            productId: true,
            category: { select: { name: true } },
          },
        })
      : [];

  const categoriesByProduct = new Map<string, string[]>();
  for (const link of categoryLinks) {
    const list = categoriesByProduct.get(link.productId) ?? [];
    list.push(link.category.name);
    categoriesByProduct.set(link.productId, list);
  }

  const paidAtIso = order.paidAt ? order.paidAt.toISOString() : null;

  return {
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paidAt: paidAtIso,
      createdAt: order.createdAt.toISOString(),
      paymentMethod: order.paymentMethod,
      customer: {
        name: order.shippingName,
        city: order.shippingCity,
        department: order.shippingDepartment,
        phone: order.shippingPhone,
        cedula: order.shippingCedula ?? null,
      },
      amounts: {
        subtotal: toNumber(order.subtotal),
        shippingCost: toNumber(order.shippingCost),
        discount: toNumber(order.discount),
        total: toNumber(order.total),
      },
      couponCode: order.appliedCoupon?.code ?? null,
    },
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      sku: item.sku,
      name: item.name,
      categories: categoriesByProduct.get(item.productId) ?? [],
      colorName: item.colorName,
      size: item.size,
      price: toNumber(item.price),
      quantity: item.quantity,
      total: toNumber(item.total),
      costPrice: null,
      imageUrl: item.imageUrl ?? null,
    })),
  };
}

export { EXPORTABLE_STATUSES };
