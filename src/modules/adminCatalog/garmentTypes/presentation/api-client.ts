import type {
  CreateGarmentTypeInputDTO,
  GarmentTypeListItemDTO,
  ToggleGarmentTypeInputDTO,
  UpdateGarmentTypeInputDTO,
} from "../contracts/garment-type.dto";

const GARMENT_TYPES_API = "/api/admin/garment-types";

type ApiErrorPayload = {
  message?: string;
  error?: string;
  name?: string;
  count?: number;
};

export class AdminGarmentTypesApiError extends Error {
  status: number;
  data?: ApiErrorPayload;

  constructor(message: string, status: number, data?: ApiErrorPayload) {
    super(message);
    this.name = "AdminGarmentTypesApiError";
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

async function assertOk(response: Response): Promise<unknown> {
  const payload = await parseResponse(response);
  if (response.ok) return payload;

  const message =
    typeof payload === "string"
      ? payload
      : (payload as ApiErrorPayload | null)?.message ??
        (payload as ApiErrorPayload | null)?.error ??
        `HTTP ${response.status}`;

  throw new AdminGarmentTypesApiError(message, response.status, (payload as ApiErrorPayload) ?? undefined);
}

export async function fetchGarmentTypes(): Promise<GarmentTypeListItemDTO[]> {
  const response = await fetch(GARMENT_TYPES_API);
  return (await assertOk(response)) as GarmentTypeListItemDTO[];
}

export async function createGarmentType(payload: CreateGarmentTypeInputDTO): Promise<GarmentTypeListItemDTO> {
  const response = await fetch(GARMENT_TYPES_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as GarmentTypeListItemDTO;
}

export async function updateGarmentType(
  id: string,
  payload: Omit<UpdateGarmentTypeInputDTO, "id">
): Promise<GarmentTypeListItemDTO> {
  const response = await fetch(`${GARMENT_TYPES_API}?id=${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as GarmentTypeListItemDTO;
}

export async function toggleGarmentType(id: string): Promise<GarmentTypeListItemDTO> {
  const payload: Omit<ToggleGarmentTypeInputDTO, "id"> = { action: "toggle" };
  const response = await fetch(`${GARMENT_TYPES_API}?id=${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await assertOk(response)) as GarmentTypeListItemDTO;
}

export async function deleteGarmentType(id: string): Promise<void> {
  const response = await fetch(`${GARMENT_TYPES_API}?id=${id}`, { method: "DELETE" });
  await assertOk(response);
}
