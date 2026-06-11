import type {
  CategoryListItemDTO,
  CreateCategoryInputDTO,
  ToggleCategoryInputDTO,
  UpdateCategoryInputDTO,
} from "../contracts/category.dto";

const CATEGORIES_API = "/api/admin/categories";

type CategoryDeleteResponseDTO = {
  success: boolean;
  id: string;
  name: string;
};

type ApiErrorPayload = {
  message?: string;
  name?: string;
  count?: number;
  error?: string;
};

export class CategoryApiError extends Error {
  status: number;
  data?: ApiErrorPayload;

  constructor(message: string, status: number, data?: ApiErrorPayload) {
    super(message);
    this.name = "CategoryApiError";
    this.status = status;
    this.data = data;
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

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  const payload = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : (payload as ApiErrorPayload | null)?.message ?? "Request failed";

    throw new CategoryApiError(message, response.status, (payload as ApiErrorPayload) ?? undefined);
  }

  return payload as T;
}

export function fetchCategories() {
  return requestJson<CategoryListItemDTO[]>(CATEGORIES_API);
}

export function createCategory(payload: CreateCategoryInputDTO) {
  return requestJson<CategoryListItemDTO>(CATEGORIES_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateCategory(id: string, payload: Omit<UpdateCategoryInputDTO, "id">) {
  return requestJson<CategoryListItemDTO>(`${CATEGORIES_API}?id=${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function toggleCategory(id: string) {
  const payload: Omit<ToggleCategoryInputDTO, "id"> = { action: "toggle" };

  return requestJson<CategoryListItemDTO>(`${CATEGORIES_API}?id=${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(id: string) {
  return requestJson<CategoryDeleteResponseDTO>(`${CATEGORIES_API}?id=${id}`, {
    method: "DELETE",
  });
}
