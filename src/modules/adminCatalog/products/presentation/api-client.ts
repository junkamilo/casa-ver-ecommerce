import type { AdminPosProductListDTO } from "../contracts/admin-pos-product.dto";

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

/** Productos que el POS publica, con la capa web de cada uno. */
export async function fetchAdminProducts(): Promise<AdminPosProductListDTO> {
  const response = await fetch(PRODUCTS_API, { cache: "no-store" });
  return (await assertOk(response)) as AdminPosProductListDTO;
}

export type PosManagedProductPayload = {
  isNew: boolean;
  isOnSale: boolean;
  coverImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

/** Guarda la capa web de un producto del POS (por slug). */
export async function updatePosManagedProduct(slug: string, payload: PosManagedProductPayload) {
  const response = await fetch(`${PRODUCTS_API}/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return assertOk(response);
}
