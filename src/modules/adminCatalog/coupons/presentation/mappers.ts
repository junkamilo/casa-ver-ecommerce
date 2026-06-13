import type { CouponListItemDTO, CouponUsageDetailDTO } from "../contracts/coupon.dto";

const STATUS_MAP: Record<string, string> = {
  PENDING: "Pendiente",
  PROCESSING: "Procesando",
  PAID: "Pagado",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
};

const METHOD_MAP: Record<string, string> = {
  BOLD: "Bold",
  ADDI: "Addi",
  NEQUI: "Nequi",
  BANCOLOMBIA: "Bancolombia",
  DAVIPLATA: "Daviplata",
};

type CouponRow = {
  id: string;
  code: string;
  discountPercentage: number;
  assignedEmail: string | null;
  isUsed: boolean;
  usedAt: Date | null;
  batchId: string | null;
  createdAt: Date;
  batch?: { createdAt: Date } | null;
};

export function mapCouponToListItem(coupon: CouponRow): CouponListItemDTO {
  return {
    id: coupon.id,
    code: coupon.code,
    discountPercentage: coupon.discountPercentage,
    assignedEmail: coupon.assignedEmail,
    isUsed: coupon.isUsed,
    usedAt: coupon.usedAt?.toISOString() ?? null,
    batchId: coupon.batchId,
    batchCreatedAt: coupon.batch?.createdAt?.toISOString() ?? null,
    createdAt: coupon.createdAt.toISOString(),
  };
}

type OrderUsageRow = {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  subtotal: unknown;
  shippingCost: unknown;
  discount: unknown;
  total: unknown;
  createdAt: Date;
  shippingName: string;
  shippingPhone: string;
  shippingCedula: string | null;
  shippingAddress: string;
  shippingCity: string;
  shippingDepartment: string;
  user: { email: string | null; name: string | null };
};

export function mapCouponUsageToDetail(
  coupon: {
    id: string;
    code: string;
    discountPercentage: number;
    usedAt: Date | null;
  },
  order: OrderUsageRow
): CouponUsageDetailDTO {
  return {
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      usedAt: coupon.usedAt?.toISOString() ?? new Date().toISOString(),
    },
    customer: {
      name: order.shippingName || order.user.name || "—",
      email: order.user.email ?? "—",
      phone: order.shippingPhone,
      cedula: order.shippingCedula,
      city: order.shippingCity,
      department: order.shippingDepartment,
      address: order.shippingAddress,
    },
    order: {
      orderNumber: order.orderNumber,
      status: STATUS_MAP[order.status] ?? order.status,
      paymentMethod: METHOD_MAP[order.paymentMethod] ?? order.paymentMethod,
      subtotal: Number(order.subtotal),
      shippingCost: Number(order.shippingCost),
      discount: Number(order.discount),
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
    },
  };
}
