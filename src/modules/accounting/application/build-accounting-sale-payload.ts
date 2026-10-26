import { prisma } from "@/lib/prisma";
import { parsePosLineId } from "@/modules/posIntegration/domain/pos-mapper";
import { getPosCategoriesBySlug } from "@/modules/posIntegration/application/get-pos-product-categories.use-case";
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

  // Ítems del POS (SKU del POS como variantId): sus categorías son las que publica el POS hoy.
  // Los productos creados en la web no tienen categorías (la web ya no guarda categorías).
  const posSlugOf = (variantId: string) => parsePosLineId(variantId)?.slug ?? null;
  const categoriesBySlug = await getPosCategoriesBySlug(
    order.items.map((item) => posSlugOf(item.variantId)).filter((slug): slug is string => Boolean(slug)),
  );
  const categoriesOf = (variantId: string) => {
    const slug = posSlugOf(variantId);
    return slug ? (categoriesBySlug.get(slug) ?? []).map((c) => c.name) : [];
  };

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
      couponCode: order.couponCode ?? null,
    },
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      sku: item.sku,
      name: item.name,
      categories: categoriesOf(item.variantId),
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
