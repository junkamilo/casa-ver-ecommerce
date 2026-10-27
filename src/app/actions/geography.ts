"use server";

import {
  listDepartmentNames,
  listMunicipalityNames,
  quoteShippingForAddress,
} from "@/modules/shipping/application/pos-shipping";

/**
 * Selectores de dirección (checkout y perfil): departamentos y municipios con cobertura según el POS
 * (GET /api/public/geography/**). La web no guarda geografía.
 */
export async function getPublicDepartmentsAction(): Promise<string[]> {
  try {
    return await listDepartmentNames();
  } catch (error) {
    console.error("Error fetching departments:", error);
    return [];
  }
}

export async function getPublicMunicipalitiesAction(departmentName: string): Promise<string[]> {
  try {
    return await listMunicipalityNames(departmentName);
  } catch (error) {
    console.error("Error fetching municipalities:", error);
    return [];
  }
}

/** Precio de envío a una ciudad (vista previa del perfil), calculado por el POS. */
export async function getAddressShippingPreviewAction(
  city: string,
  department: string,
): Promise<{ cost: number; rateName: string | null } | null> {
  if (!city || !department) return null;
  try {
    const quote = await quoteShippingForAddress({ city, department, subtotalNeto: 0 });
    return quote.ok && quote.baseCost != null ? { cost: quote.baseCost, rateName: quote.rateName } : null;
  } catch {
    return null;
  }
}
