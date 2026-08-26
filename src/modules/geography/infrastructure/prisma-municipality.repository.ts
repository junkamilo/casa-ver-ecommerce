import { prisma as db } from "@/lib/prisma";
import { normalizeString } from "../domain/normalize-string";
import type { CreateMunicipalityInput, UpdateMunicipalityInput } from "../contracts/geography.dto";

export function listActiveMunicipalitiesByDepartment(departmentId: string) {
  return db.municipality.findMany({
    where: { departmentId, isActive: true },
    orderBy: { name: "asc" },
  });
}

export function findMunicipalityById(id: string) {
  return db.municipality.findUnique({
    where: { id },
    include: { department: { select: { name: true } } },
  });
}

export function createMunicipality(input: CreateMunicipalityInput) {
  return db.municipality.create({
    data: {
      departmentId: input.departmentId,
      daneCode: input.daneCode ?? null,
      name: input.name.trim(),
      normalizedName: normalizeString(input.name),
      isActive: input.isActive,
    },
  });
}

export function updateMunicipality(id: string, input: UpdateMunicipalityInput) {
  const data: Record<string, unknown> = {};

  if (input.daneCode !== undefined) data.daneCode = input.daneCode ?? null;
  if (input.name !== undefined) {
    data.name = input.name.trim();
    data.normalizedName = normalizeString(input.name);
  }
  if (input.isActive !== undefined) data.isActive = input.isActive;

  return db.municipality.update({ where: { id }, data });
}

/**
 * Admin: paginado + búsqueda por normalizedName (contains, mismo criterio
 * client-side que Países/Departamentos: includes ignorando tildes).
 */
export function searchMunicipalitiesForAdmin(params: {
  departmentId?: string;
  q?: string;
  page: number;
  pageSize: number;
}) {
  const { departmentId, q, page, pageSize } = params;
  const normalizedQ = q ? normalizeString(q) : "";
  const where = {
    ...(departmentId ? { departmentId } : {}),
    ...(normalizedQ ? { normalizedName: { contains: normalizedQ } } : {}),
  };

  return db.$transaction([
    db.municipality.count({ where }),
    db.municipality.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { department: { select: { name: true } } },
    }),
  ]);
}
