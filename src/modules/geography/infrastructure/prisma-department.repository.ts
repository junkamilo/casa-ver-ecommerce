import { prisma as db } from "@/lib/prisma";
import { normalizeString } from "../domain/normalize-string";
import type { CreateDepartmentInput, UpdateDepartmentInput } from "../contracts/geography.dto";

export function listAllDepartments(countryId?: string) {
  return db.department.findMany({
    where: countryId ? { countryId } : undefined,
    include: { country: { select: { name: true } } },
    orderBy: { name: "asc" },
  });
}

export function listActiveDepartmentsByCountry(countryId: string) {
  return db.department.findMany({
    where: { countryId, isActive: true },
    orderBy: { name: "asc" },
  });
}

export function findDepartmentById(id: string) {
  return db.department.findUnique({
    where: { id },
    include: { country: { select: { name: true } } },
  });
}

export function createDepartment(input: CreateDepartmentInput) {
  return db.department.create({
    data: {
      countryId: input.countryId,
      daneCode: input.daneCode ?? null,
      name: input.name.trim(),
      normalizedName: normalizeString(input.name),
      isActive: input.isActive,
    },
  });
}

export function updateDepartment(id: string, input: UpdateDepartmentInput) {
  const data: Record<string, unknown> = {};

  if (input.daneCode !== undefined) data.daneCode = input.daneCode ?? null;
  if (input.name !== undefined) {
    data.name = input.name.trim();
    data.normalizedName = normalizeString(input.name);
  }
  if (input.isActive !== undefined) data.isActive = input.isActive;

  return db.department.update({ where: { id }, data });
}
