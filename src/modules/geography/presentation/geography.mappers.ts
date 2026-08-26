/**
 * Mappers: Prisma model → DTO público / admin.
 * Nunca exponemos createdAt/updatedAt internos al front público.
 */

import type {
  CountryPublicDTO,
  CountryAdminDTO,
  DepartmentPublicDTO,
  DepartmentAdminDTO,
  MunicipalityPublicDTO,
  MunicipalityAdminDTO,
} from "../contracts/geography.dto";

// ── Tipos de entrada (lo que devuelve Prisma) ───────────────────────────────

type CountryRow = {
  id: string;
  isoCode2: string;
  isoCode3: string;
  numericCode: string | null;
  name: string;
  phoneCode: string | null;
  currency: string | null;
  isActive: boolean;
};

type DepartmentRow = {
  id: string;
  countryId?: string;
  daneCode: string | null;
  name: string;
  normalizedName: string;
  isActive: boolean;
  country?: { name: string };
};

type MunicipalityRow = {
  id: string;
  departmentId: string;
  daneCode: string | null;
  name: string;
  normalizedName: string;
  isActive: boolean;
  department?: { name: string };
  shippingRateId?: string | null;
};

// ── Public DTOs ─────────────────────────────────────────────────────────────

export function toCountryPublicDTO(row: CountryRow): CountryPublicDTO {
  return {
    id: row.id,
    isoCode2: row.isoCode2,
    name: row.name,
    phoneCode: row.phoneCode,
  };
}

export function toDepartmentPublicDTO(row: DepartmentRow): DepartmentPublicDTO {
  return {
    id: row.id,
    name: row.name,
    daneCode: row.daneCode,
  };
}

export function toMunicipalityPublicDTO(row: MunicipalityRow): MunicipalityPublicDTO {
  return {
    id: row.id,
    name: row.name,
    daneCode: row.daneCode,
  };
}

// ── Admin DTOs ──────────────────────────────────────────────────────────────

export function toCountryAdminDTO(row: CountryRow): CountryAdminDTO {
  return {
    id: row.id,
    isoCode2: row.isoCode2,
    isoCode3: row.isoCode3,
    numericCode: row.numericCode,
    name: row.name,
    phoneCode: row.phoneCode,
    currency: row.currency,
    isActive: row.isActive,
  };
}

export function toDepartmentAdminDTO(row: DepartmentRow): DepartmentAdminDTO {
  return {
    id: row.id,
    countryId: row.countryId ?? "",
    daneCode: row.daneCode,
    name: row.name,
    normalizedName: row.normalizedName,
    isActive: row.isActive,
    countryName: row.country?.name ?? "",
  };
}

export function toMunicipalityAdminDTO(row: MunicipalityRow): MunicipalityAdminDTO {
  return {
    id: row.id,
    departmentId: row.departmentId,
    daneCode: row.daneCode,
    name: row.name,
    normalizedName: row.normalizedName,
    isActive: row.isActive,
    departmentName: row.department?.name ?? "",
    shippingRateId: row.shippingRateId,
  };
}
