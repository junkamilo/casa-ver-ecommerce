import type {
  AdminProductListItemDTO,
  AdminProductListResponseDTO,
} from "../contracts/product-list.dto";
import type { ProductCreateInputDTO } from "../contracts/product-create.dto";
import type { ProductVariantStockDTO } from "../contracts/product-variant.dto";
import type { AdminProductDetailDTO } from "./mappers";

const PRODUCTS_API = "/api/admin/products";

type ApiErrorShape = {
  message?: string;
  error?: string;
};

export class AdminProductsApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminProductsApiError";
    this.status = status;
  }
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

async function assertOk(response: Response): Promise<unknown> {
  const payload = await parseBody(response);
  if (response.ok) return payload;

  const normalizedMessage =
    typeof payload === "string"
      ? payload
      : (payload as ApiErrorShape | null)?.message ??
        (payload as ApiErrorShape | null)?.error ??
        `HTTP ${response.status}`;

  throw new AdminProductsApiError(normalizedMessage, response.status);
}

export type FetchAdminProductsParams = {
  page?: number;
  limit?: number;
};

export async function fetchAdminProducts(
  params: FetchAdminProductsParams = {}
): Promise<AdminProductListResponseDTO> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();

  const response = await fetch(query ? `${PRODUCTS_API}?${query}` : PRODUCTS_API);
  return (await assertOk(response)) as AdminProductListResponseDTO;
}

export async function fetchAdminProductById(id: string): Promise<AdminProductDetailDTO> {
  const response = await fetch(`${PRODUCTS_API}/${id}`);
  return (await assertOk(response)) as AdminProductDetailDTO;
}

export async function createAdminProduct(payload: ProductCreateInputDTO) {
  const response = await fetch(PRODUCTS_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return assertOk(response);
}

export async function updateAdminProduct(id: string, payload: ProductCreateInputDTO) {
  const response = await fetch(`${PRODUCTS_API}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return assertOk(response);
}

export async function toggleAdminProduct(id: string, active: boolean) {
  const response = await fetch(`${PRODUCTS_API}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  });

  return assertOk(response);
}

export async function deleteAdminProduct(id: string) {
  const response = await fetch(`${PRODUCTS_API}/${id}`, {
    method: "DELETE",
  });

  return assertOk(response);
}

export async function updateVariantStock(productId: string, variantId: string, stock: number) {
  const response = await fetch(`${PRODUCTS_API}/${productId}/variants/${variantId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stock }),
  });

  return (await assertOk(response)) as ProductVariantStockDTO;
}

export async function fetchAdminCategories() {
  const response = await fetch("/api/admin/categories");
  return assertOk(response);
}

export async function fetchActivePresetColors() {
  const response = await fetch("/api/admin/colors?active=true");
  return assertOk(response);
}
