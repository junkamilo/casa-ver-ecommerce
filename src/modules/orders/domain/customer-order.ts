// «Mis pedidos»: la web solo guarda el pago del pedido (Neon); la logística, la guía, las fechas de envío y
// entrega y las prendas registradas viven en el POS (md/COMPARACION-TABLAS-PEDIDOS-POS-vs-WEB.md).
// Funciones puras: el acceso a Neon y al POS está en application/customer-orders.ts.

import { parsePosLineId } from "@/modules/posIntegration/domain/pos-mapper";
import type { PosCustomerOrder } from "@/modules/posIntegration/contracts/pos-catalog.schema";

export type CustomerOrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PAID"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "FAILED"
  | "REFUNDED";

/** Lo que la web sabe del pedido: el checkout y el pago. */
export interface NeonOrderForCustomer {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  paymentMethod: string | null;
  paidAt: Date | null;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDepartment: string;
  items: {
    id: string;
    variantId: string;
    name: string;
    imageUrl: string | null;
    colorName: string;
    size: string;
    quantity: number;
    price: number;
  }[];
}

export interface CustomerOrderView {
  id: string;
  orderNumber: string;
  status: CustomerOrderStatus;
  createdAt: string;
  updatedAt: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  paymentMethod: string | null;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  trackingCode?: string;
  trackingUrl?: string;
  shippingRateName?: string;
  shippingAddress: { fullName: string; address: string; city: string; department: string };
  items: {
    id: string;
    productName: string;
    productImage: string;
    color: string;
    size: string;
    quantity: number;
    unitPrice: number;
  }[];
}

const STATUSES: ReadonlySet<string> = new Set([
  "PENDING", "PROCESSING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED", "REFUNDED",
]);

/** Pedidos que el POS debería tener (ya se pagaron). */
export function isReportedToPos(status: string, paidAt: Date | null): boolean {
  return paidAt != null && status !== "PENDING" && status !== "FAILED";
}

/**
 * Une el pedido de Neon con el del POS. Con el POS: su estado logístico, guía, fechas, destinatario y prendas
 * (las del POS con la foto de la web; las que solo existen en la web se agregan). Sin el POS (sin pagar, o
 * pagado y aún sin registrar): lo de Neon.
 */
export function toCustomerOrderView(neon: NeonOrderForCustomer, pos: PosCustomerOrder | null): CustomerOrderView {
  const base: CustomerOrderView = {
    id: neon.id,
    orderNumber: neon.orderNumber,
    status: (STATUSES.has(neon.status) ? neon.status : "PENDING") as CustomerOrderStatus,
    createdAt: neon.createdAt.toISOString(),
    updatedAt: neon.updatedAt.toISOString(),
    total: neon.total,
    subtotal: neon.subtotal,
    shippingCost: neon.shippingCost,
    discount: neon.discount,
    paymentMethod: neon.paymentMethod,
    paidAt: neon.paidAt?.toISOString() ?? null,
    shippedAt: null,
    deliveredAt: null,
    shippingAddress: {
      fullName: neon.shippingName,
      address: neon.shippingAddress,
      city: neon.shippingCity,
      department: neon.shippingDepartment,
    },
    items: neon.items.map((item) => ({
      id: item.id,
      productName: item.name,
      productImage: item.imageUrl ?? "",
      color: item.colorName,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.price,
    })),
  };
  if (!pos) return base;

  // Foto de la web para cada prenda del POS (slug + color + talla del SKU de la línea).
  const imageOf = new Map<string, string>();
  const webOnly = neon.items.filter((item) => {
    const ref = parsePosLineId(item.variantId);
    if (ref) imageOf.set(`${ref.slug}|${ref.colorId}|${ref.sizeId}`, item.imageUrl ?? "");
    return !ref;
  });
  const posItems = pos.lines.map((line, index) => ({
    id: `${pos.orderNumber}-${index}`,
    productName: line.name,
    productImage: imageOf.get(`${(line.productSlug ?? "").toLowerCase()}|${line.colorId}|${line.sizeId}`) ?? "",
    color: line.colorName ?? "",
    size: line.sizeName ?? "",
    quantity: line.quantity,
    unitPrice: line.unitPrice,
  }));

  const fulfillment = pos.fulfillmentStatus;
  return {
    ...base,
    status: (fulfillment ?? base.status) as CustomerOrderStatus,
    updatedAt: pos.updatedAt ?? base.updatedAt,
    paidAt: pos.paidAt ?? base.paidAt,
    shippedAt: pos.shippedAt,
    deliveredAt: pos.deliveredAt,
    trackingCode: pos.trackingNumber ?? undefined,
    trackingUrl: pos.trackingUrl ?? undefined,
    shippingRateName: pos.shippingRateName ?? undefined,
    shippingAddress: {
      fullName: pos.shippingName ?? base.shippingAddress.fullName,
      address: pos.address ?? base.shippingAddress.address,
      city: pos.city ?? base.shippingAddress.city,
      department: pos.department ?? base.shippingAddress.department,
    },
    items: [...posItems, ...base.items.filter((item) => webOnly.some((w) => w.id === item.id))],
  };
}
