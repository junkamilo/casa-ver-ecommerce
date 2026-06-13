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

export type PromotionalCouponListItemDTO = {
  id: string;
  code: string;
  codeSource: "RANDOM" | "CUSTOM" | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxGlobalUses: number;
  maxUsesPerUser: number;
  currentGlobalUses: number;
  isActive: boolean;
  scheduleMode: "NONE" | "SINGLE_DAY" | "DATE_RANGE";
  validFrom: string | null;
  validTo: string | null;
  scheduleLabel: string;
  status: "ACTIVE" | "EXHAUSTED" | "INACTIVE" | "EXPIRED" | "SCHEDULED";
  createdAt: string;
};

export type PromotionalCouponListResponseDTO = {
  data: PromotionalCouponListItemDTO[];
  pagination: CouponListPaginationDTO;
};

export type CreatePromotionalCouponInputDTO = {
  codeSource: "RANDOM" | "CUSTOM";
  code?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxGlobalUses: number;
  scheduleEnabled: boolean;
  scheduleMode?: "SINGLE_DAY" | "DATE_RANGE";
  singleDayDate?: string;
  startTime?: string;
  endTime?: string;
  fromDate?: string;
  toDate?: string;
};

export type PromotionalCouponUsageItemDTO = {
  id: string;
  email: string;
  documentId: string;
  orderNumber: string;
  orderStatus: string;
  usedAt: string;
};
