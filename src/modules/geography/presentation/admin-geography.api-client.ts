import type {
  CountryAdminDTO,
  DepartmentAdminDTO,
  MunicipalityAdminDTO,
  CreateCountryInput,
  UpdateCountryInput,
  CreateDepartmentInput,
  UpdateDepartmentInput,
  CreateMunicipalityInput,
  UpdateMunicipalityInput,
  PaginatedResult,
} from "../contracts/geography.dto";

export class AdminGeographyApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminGeographyApiError";
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

  throw new AdminGeographyApiError(
    getErrorMessage(payload, "Error en API de geografía"),
    response.status,
  );
}

// COUNTRIES
export async function fetchAdminCountries() {
  const response = await fetch("/api/admin/geography/countries", { cache: "no-store" });
  return assertOk(response) as Promise<CountryAdminDTO[]>;
}

export async function createAdminCountry(data: CreateCountryInput) {
  const response = await fetch("/api/admin/geography/countries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return assertOk(response) as Promise<CountryAdminDTO>;
}

export async function updateAdminCountry(id: string, data: UpdateCountryInput) {
  const response = await fetch(`/api/admin/geography/countries/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return assertOk(response) as Promise<CountryAdminDTO>;
}

// DEPARTMENTS
export async function fetchAdminDepartments(countryId?: string) {
  const url = countryId ? `/api/admin/geography/departments?countryId=${countryId}` : "/api/admin/geography/departments";
  const response = await fetch(url, { cache: "no-store" });
  return assertOk(response) as Promise<DepartmentAdminDTO[]>;
}

export async function createAdminDepartment(data: CreateDepartmentInput) {
  const response = await fetch("/api/admin/geography/departments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return assertOk(response) as Promise<DepartmentAdminDTO>;
}

export async function updateAdminDepartment(id: string, data: UpdateDepartmentInput) {
  const response = await fetch(`/api/admin/geography/departments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return assertOk(response) as Promise<DepartmentAdminDTO>;
}

// MUNICIPALITIES
export async function fetchAdminMunicipalities(page = 1, pageSize = 50, departmentId?: string, search?: string) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (departmentId) params.append("departmentId", departmentId);
  // La API lee `q` (mismo patrón de búsqueda que el resto del módulo de geografía)
  if (search) params.append("q", search);

  const response = await fetch(`/api/admin/geography/municipalities?${params.toString()}`, { cache: "no-store" });
  return assertOk(response) as Promise<PaginatedResult<MunicipalityAdminDTO>>;
}

export async function createAdminMunicipality(data: CreateMunicipalityInput) {
  const response = await fetch("/api/admin/geography/municipalities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return assertOk(response) as Promise<MunicipalityAdminDTO>;
}

export async function updateAdminMunicipality(id: string, data: UpdateMunicipalityInput) {
  const response = await fetch(`/api/admin/geography/municipalities/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return assertOk(response) as Promise<MunicipalityAdminDTO>;
}
