import {
  type CreateShippingRateDTO,
  type UpdateShippingRateDTO,
  type ShippingRateDTO,
  type ShippingCityDTO,
  type UpdateShippingConfigDTO,
  type ShippingConfigDTO,
  type AssignCityRateDTO,
  type CatalogCityDTO,
  type ShippingDepartmentDTO,
} from "../contracts/shipping.dto";

export class AdminShippingApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminShippingApiError";
    this.status = status;
  }
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    const record = payload as { message?: unknown; error?: unknown };
    if (typeof record.message === "string") return record.message;
    if (typeof record.error === "string") return record.error;
  }
  return fallback;
}

async function assertOk(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (response.ok) return payload;

  throw new AdminShippingApiError(
    getErrorMessage(payload, "Error en API de envíos"),
    response.status,
  );
}

export async function fetchShippingConfig(): Promise<ShippingConfigDTO> {
  const response = await fetch("/api/admin/shipping-config", { cache: "no-store" });
  return assertOk(response) as Promise<ShippingConfigDTO>;
}

export async function updateShippingConfig(data: UpdateShippingConfigDTO) {
  const response = await fetch("/api/admin/shipping-config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return assertOk(response);
}

export async function fetchShippingRates() {
  const response = await fetch("/api/admin/shipping-rates", { cache: "no-store" });
  return assertOk(response) as Promise<ShippingRateDTO[]>;
}

export async function createShippingRate(data: CreateShippingRateDTO) {
  const response = await fetch("/api/admin/shipping-rates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return assertOk(response) as Promise<ShippingRateDTO>;
}

export async function updateShippingRate(id: string, data: UpdateShippingRateDTO) {
  const response = await fetch(`/api/admin/shipping-rates/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return assertOk(response) as Promise<ShippingRateDTO>;
}

export async function deleteShippingRate(id: string): Promise<void> {
  const res = await fetch(`/api/admin/shipping-rates/${id}`, { method: "DELETE" });
  await assertOk(res);
}

export async function assignRateZones(rateId: string, municipalityIds: string[]): Promise<void> {
  const res = await fetch(`/api/admin/shipping-rates/${rateId}/zones`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ municipalityIds }),
  });
  await assertOk(res);
}

export async function fetchShippingDepartments() {
  const response = await fetch("/api/admin/shipping-departments", { cache: "no-store" });
  return assertOk(response) as Promise<ShippingDepartmentDTO[]>;
}

export async function fetchShippingCities() {
  const response = await fetch("/api/admin/shipping-cities", { cache: "no-store" });
  return assertOk(response) as Promise<ShippingCityDTO[]>;
}

export async function assignShippingCity(cityId: string, shippingRateId: string) {
  const payload: AssignCityRateDTO = { cityId, shippingRateId };
  const response = await fetch("/api/admin/shipping-cities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return assertOk(response);
}

export async function unassignShippingCity(cityId: string) {
  const response = await fetch(`/api/admin/shipping-cities/${cityId}`, {
    method: "DELETE",
  });
  return assertOk(response);
}

export async function searchCatalogCities(query: string) {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/admin/cities/search?${params.toString()}`);
  return assertOk(response) as Promise<CatalogCityDTO[]>;
}
