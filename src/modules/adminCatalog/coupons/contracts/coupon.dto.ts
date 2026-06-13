export type CouponListQueryDTO = {
  page: number;
  limit: number;
  search?: string;
};

export type CouponListItemDTO = {
  id: string;
  code: string;
  discountPercentage: number;
  assignedEmail: string | null;
  isUsed: boolean;
  usedAt: string | null;
  batchId: string | null;
  batchCreatedAt: string | null;
  createdAt: string;
};

export type CouponListPaginationDTO = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type CouponListResponseDTO = {
  data: CouponListItemDTO[];
  pagination: CouponListPaginationDTO;
};

export type GenerateCouponsInputDTO = {
  discountPercentage: number;
  quantity: number;
  createdById?: string;
};

export type GenerateCouponsResponseDTO = {
  batch: {
    id: string;
    discountPercentage: number;
    quantity: number;
    createdAt: string;
  };
  coupons: CouponListItemDTO[];
};

export type CouponUsageDetailDTO = {
  coupon: {
    id: string;
    code: string;
    discountPercentage: number;
    usedAt: string;
  };
  customer: {
    name: string;
    email: string;
    phone: string;
    cedula: string | null;
    city: string;
    department: string;
    address: string;
  };
  order: {
    orderNumber: string;
    status: string;
    paymentMethod: string;
    subtotal: number;
    shippingCost: number;
    discount: number;
    total: number;
    createdAt: string;
  };
};
