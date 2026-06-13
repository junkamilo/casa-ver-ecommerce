import type {
  CouponListResponseDTO,
  CouponUsageDetailDTO,
  GenerateCouponsResponseDTO,
  PromotionalCouponListItemDTO,
  PromotionalCouponListResponseDTO,
} from "../contracts/coupon.dto";

const COUPONS_API = "/api/admin/coupons";
const COUPONS_USAGE_API = "/api/admin/coupons/usage";
const PROMOTIONAL_COUPONS_API = "/api/admin/coupons/promotional";
const PROMOTIONAL_USAGES_API = "/api/admin/coupons/promotional/usages";

type ApiErrorPayload = {
  message?: string;
  error?: string;
};

export class AdminCouponsApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminCouponsApiError";
    this.status = status;
  }
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text || null;
}

async function assertOk(response: Response): Promise<unknown> {
  const payload = await parseResponse(response);
  if (response.ok) return payload;

  const message =
    typeof payload === "string"
      ? payload
      : (payload as ApiErrorPayload | null)?.message ??
        (payload as ApiErrorPayload | null)?.error ??
        `HTTP ${response.status}`;

  throw new AdminCouponsApiError(message, response.status);
}

export async function fetchAdminCoupons(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<CouponListResponseDTO> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  const query = searchParams.toString();

  const response = await fetch(query ? `${COUPONS_API}?${query}` : COUPONS_API);
  return (await assertOk(response)) as CouponListResponseDTO;
}

export async function generateAdminCoupons(payload: {
  discountPercentage: number;
  quantity: number;
}): Promise<GenerateCouponsResponseDTO> {
  const response = await fetch(COUPONS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as GenerateCouponsResponseDTO;
}

export async function deleteAdminCoupon(id: string): Promise<{ success: boolean; id: string }> {
  const response = await fetch(`${COUPONS_API}?id=${id}`, { method: "DELETE" });
  return (await assertOk(response)) as { success: boolean; id: string };
}

export async function fetchCouponUsageDetail(id: string): Promise<CouponUsageDetailDTO> {
  const response = await fetch(`${COUPONS_USAGE_API}?id=${encodeURIComponent(id)}`);
  return (await assertOk(response)) as CouponUsageDetailDTO;
}

export async function fetchPromotionalCoupons(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PromotionalCouponListResponseDTO> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.search) searchParams.set("search", params.search);
  const query = searchParams.toString();

  const response = await fetch(
    query ? `${PROMOTIONAL_COUPONS_API}?${query}` : PROMOTIONAL_COUPONS_API
  );
  return (await assertOk(response)) as PromotionalCouponListResponseDTO;
}

export async function createPromotionalCoupon(payload: {
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
}): Promise<PromotionalCouponListItemDTO> {
  const response = await fetch(PROMOTIONAL_COUPONS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as PromotionalCouponListItemDTO;
}

export async function deactivatePromotionalCoupon(
  id: string
): Promise<{ success: boolean; id: string }> {
  const response = await fetch(`${PROMOTIONAL_COUPONS_API}?id=${id}`, { method: "PATCH" });
  return (await assertOk(response)) as { success: boolean; id: string };
}

export async function deletePromotionalCoupon(
  id: string
): Promise<{ success: boolean; id: string }> {
  const response = await fetch(`${PROMOTIONAL_COUPONS_API}?id=${id}`, { method: "DELETE" });
  return (await assertOk(response)) as { success: boolean; id: string };
}

export async function fetchPromotionalCouponUsages(id: string): Promise<{
  couponId: string;
  usages: Array<{
    id: string;
    email: string;
    documentId: string;
    orderNumber: string;
    orderStatus: string;
    usedAt: string;
  }>;
}> {
  const response = await fetch(`${PROMOTIONAL_USAGES_API}?id=${encodeURIComponent(id)}`);
  return (await assertOk(response)) as {
    couponId: string;
    usages: Array<{
      id: string;
      email: string;
      documentId: string;
      orderNumber: string;
      orderStatus: string;
      usedAt: string;
    }>;
  };
}
