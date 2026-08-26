"use server";

import { prisma } from "@/lib/prisma";
import { listActiveDepartmentsByCountry } from "@/modules/geography/infrastructure/prisma-department.repository";
import { listActiveMunicipalitiesByDepartment } from "@/modules/geography/infrastructure/prisma-municipality.repository";

// Helper to get Colombia's ID
async function getColombiaId() {
  const co = await prisma.country.findFirst({ where: { isoCode2: "CO" } });
  return co?.id;
}

export async function getPublicDepartmentsAction() {
  try {
    const countryId = await getColombiaId();
    if (!countryId) return [];
    const depts = await listActiveDepartmentsByCountry(countryId);
    // Sort alphabetically and return only names
    return depts.map(d => d.name).sort((a, b) => a.localeCompare(b, "es"));
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}

export async function getPublicMunicipalitiesAction(departmentName: string) {
  try {
    if (!departmentName) return [];
    const dept = await prisma.department.findFirst({ where: { name: departmentName } });
    if (!dept) return [];
    const munis = await listActiveMunicipalitiesByDepartment(dept.id);
    // Sort alphabetically and return only names
    return munis.map(m => m.name).sort((a, b) => a.localeCompare(b, "es"));
  } catch (error) {
    console.error("Error fetching municipalities:", error);
    return [];
  }
}
