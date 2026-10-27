import {
  isPosCatalogConfigured,
  listPosDepartments,
  listPosMunicipalities,
  quotePosShipping,
} from "@/modules/posIntegration/infrastructure/pos-catalog.client";
import type { PosGeoItem, PosShippingQuote } from "@/modules/posIntegration/contracts/pos-shipping.schema";
import { normalizeString } from "@/modules/geography/domain/normalize-string";
import { qualifiesForFreeShipping, type ShippingTerms } from "../domain/resolve-shipping-price";

/**
 * Envíos 100 % del POS (md/COMPARACION-TABLAS-PRECIO-ENVIOS-Y-CIUDADES-POS-vs-WEB.md): tarifas, cobertura,
 * envío gratis y geografía DANE se leen de su API pública; la web no guarda copia. Las listas de
 * departamentos y municipios y las condiciones de envío gratis se guardan unos minutos en memoria (el aviso
 * `shipping.upserted` las limpia); el precio de envío de una dirección siempre se pide al POS.
 */

const GEO_TTL_MS = 60 * 60 * 1000;
const TERMS_TTL_MS = 60 * 1000;

type Cached<T> = { at: number; value: T };
let departmentsCache: Cached<PosGeoItem[]> | null = null;
const municipalitiesCache = new Map<string, Cached<PosGeoItem[]>>();
let termsCache: Cached<ShippingTerms> | null = null;

function fresh<T>(entry: Cached<T> | null | undefined, ttl: number): entry is Cached<T> {
  return entry != null && Date.now() - entry.at < ttl;
}

/** El POS cambió tarifas, cobertura o envío gratis (aviso `shipping.upserted`). */
export function clearShippingCache(): void {
  departmentsCache = null;
  municipalitiesCache.clear();
  termsCache = null;
}

async function departments(): Promise<PosGeoItem[]> {
  if (fresh(departmentsCache, GEO_TTL_MS)) return departmentsCache.value;
  const value = await listPosDepartments("CO");
  departmentsCache = { at: Date.now(), value };
  return value;
}

/** Departamentos de Colombia con cobertura, por nombre (orden alfabético). */
export async function listDepartmentNames(): Promise<string[]> {
  if (!isPosCatalogConfigured()) return [];
  return (await departments()).map((d) => d.name).sort((a, b) => a.localeCompare(b, "es"));
}

/** Municipios con cobertura del departamento (por nombre, sin importar tildes ni mayúsculas). */
export async function listMunicipalityNames(departmentName: string): Promise<string[]> {
  if (!departmentName || !isPosCatalogConfigured()) return [];
  const wanted = normalizeString(departmentName);
  const department = (await departments()).find((d) => normalizeString(d.name) === wanted);
  if (!department) return [];
  let entry = municipalitiesCache.get(department.code);
  if (!fresh(entry, GEO_TTL_MS)) {
    entry = { at: Date.now(), value: await listPosMunicipalities(department.code) };
    municipalitiesCache.set(department.code, entry);
  }
  return entry.value.map((m) => m.name).sort((a, b) => a.localeCompare(b, "es"));
}

/**
 * Condiciones de envío gratis del POS (monto y si está activo). Se piden con una cotización sin dirección:
 * el POS responde «sin cobertura» pero con sus condiciones.
 */
export async function getShippingTerms(): Promise<ShippingTerms> {
  if (fresh(termsCache, TERMS_TTL_MS)) return termsCache.value;
  const quote = await quotePosShipping({ subtotal: 0 });
  const value = { freeShippingThreshold: quote.freeShippingThreshold, freeShippingActive: quote.freeShippingActive };
  termsCache = { at: Date.now(), value };
  return value;
}

/** Precio de envío a una dirección (ciudad y departamento), calculado por el POS. Lanza si el POS no responde. */
export async function quoteShippingForAddress(input: {
  city: string;
  department: string;
  subtotalNeto: number;
}): Promise<PosShippingQuote> {
  return quotePosShipping({ city: input.city, department: input.department, subtotal: input.subtotalNeto });
}

/** Resultado para la UI del checkout (forma de `ShippingQuote` en lib/shipping.ts). */
export type CheckoutShippingQuote = {
  cost: number;
  baseCost: number | null;
  isFreeByThreshold: boolean;
  isPendingAddress: boolean;
  freeShippingThreshold: number;
  /** La dirección no tiene cobertura (o no hay tarifa): no se puede pagar. */
  noCoverage?: boolean;
  rateName?: string | null;
};

/**
 * Precio de envío para el checkout. Sin dirección completa: pendiente, con la vista previa del envío gratis
 * según las condiciones del POS. Con dirección: lo que calcule el POS.
 */
export async function quoteCheckoutShipping(input: {
  cityName?: string;
  departmentName?: string;
  subtotalNeto: number;
}): Promise<CheckoutShippingQuote> {
  const pending = async (noCoverage = false): Promise<CheckoutShippingQuote> => {
    const terms = await getShippingTerms().catch(() => ({ freeShippingThreshold: 0, freeShippingActive: false }));
    return {
      cost: 0,
      baseCost: null,
      isFreeByThreshold: !noCoverage && qualifiesForFreeShipping(terms, input.subtotalNeto),
      isPendingAddress: true,
      freeShippingThreshold: terms.freeShippingActive ? terms.freeShippingThreshold : 0,
      ...(noCoverage ? { noCoverage: true } : {}),
    };
  };
  if (!isPosCatalogConfigured() || !input.cityName || !input.departmentName) return pending();

  try {
    const quote = await quoteShippingForAddress({
      city: input.cityName,
      department: input.departmentName,
      subtotalNeto: input.subtotalNeto,
    });
    if (!quote.ok || quote.cost == null) return pending(true);
    return {
      cost: quote.cost,
      baseCost: quote.baseCost,
      isFreeByThreshold: quote.freeByThreshold,
      isPendingAddress: false,
      freeShippingThreshold: quote.freeShippingActive ? quote.freeShippingThreshold : 0,
      rateName: quote.rateName,
    };
  } catch (error) {
    console.warn("[envíos] El POS no cotizó el envío:", error);
    return pending();
  }
}
