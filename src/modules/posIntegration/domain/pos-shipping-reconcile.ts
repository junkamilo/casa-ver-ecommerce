import { normalizeString } from "@/modules/geography/domain/normalize-string";
import type { PosShippingRate, PosShippingSnapshot } from "../contracts/pos-shipping.schema";

/**
 * Concilia una lista del POS con las filas locales. Cada fila del POS se enlaza con la primera fila
 * local libre que comparta alguna de sus claves (en orden: la principal y luego las de adopción).
 * Resultado: filas a crear, filas a actualizar (solo si algo cambió) y filas locales sin pareja.
 */
export function reconcile<P, L extends { id: string }, D extends object>(
  pos: P[],
  local: L[],
  options: {
    posKeys: (item: P) => string[];
    localKeys: (row: L) => string[];
    toData: (item: P) => D;
  },
): { creates: D[]; updates: { id: string; data: Partial<D> }[]; missing: L[] } {
  const byKey = new Map<string, L>();
  for (const row of local) {
    for (const key of options.localKeys(row)) if (!byKey.has(key)) byKey.set(key, row);
  }

  const used = new Set<string>();
  const creates: D[] = [];
  const updates: { id: string; data: Partial<D> }[] = [];

  for (const item of pos) {
    const data = options.toData(item);
    const match = options
      .posKeys(item)
      .map((key) => byKey.get(key))
      .find((row): row is L => row !== undefined && !used.has(row.id));
    if (!match) {
      creates.push(data);
      continue;
    }
    used.add(match.id);
    const changed = changedFields(match, data);
    if (Object.keys(changed).length > 0) updates.push({ id: match.id, data: changed });
  }

  return { creates, updates, missing: local.filter((row) => !used.has(row.id)) };
}

function changedFields<D extends object>(row: object, data: D): Partial<D> {
  const current = row as Record<string, unknown>;
  const out: Partial<D> = {};
  for (const [key, value] of Object.entries(data) as [keyof D & string, D[keyof D & string]][]) {
    if (current[key] !== value) out[key] = value;
  }
  return out;
}

// ── Tarifas ────────────────────────────────────────────────────────────────────

export type LocalShippingRate = {
  id: string;
  posRateId: string | null;
  name: string | null;
  price: number;
  isActive: boolean;
};

export type ShippingRateData = { posRateId: string; name: string | null; price: number; isActive: boolean };

/**
 * Tarifas: por posRateId; la primera vez adopta la tarifa de la web con el mismo id o, si no, una
 * sin enlazar con el mismo nombre y precio (así no se duplican las que el POS copió de la web).
 */
export function reconcileRates(pos: PosShippingRate[], local: LocalShippingRate[]) {
  const rateName = (name: string | null) => (name ?? "").trim().toLowerCase();
  return reconcile(pos, local, {
    posKeys: (r) => [`pos:${r.rateId}`, `id:${r.rateId}`, `np:${rateName(r.name)}|${r.price}`],
    localKeys: (r) =>
      r.posRateId
        ? [`pos:${r.posRateId}`]
        : [`id:${r.id}`, `np:${rateName(r.name)}|${r.price}`],
    toData: (r): ShippingRateData => ({
      posRateId: r.rateId,
      name: r.name?.trim() || null,
      price: r.price,
      isActive: r.active,
    }),
  });
}

// ── Geografía ──────────────────────────────────────────────────────────────────

export type LocalCountry = {
  id: string;
  isoCode2: string;
  isoCode3: string;
  numericCode: string | null;
  name: string;
  phoneCode: string | null;
  currency: string | null;
  isActive: boolean;
};

export type LocalDepartment = {
  id: string;
  countryId: string;
  daneCode: string | null;
  name: string;
  normalizedName: string;
  isActive: boolean;
};

export type LocalMunicipality = {
  id: string;
  departmentId: string;
  daneCode: string | null;
  name: string;
  normalizedName: string;
  shippingRateId: string | null;
  isActive: boolean;
};

export function reconcileCountries(snapshot: PosShippingSnapshot, local: LocalCountry[]) {
  return reconcile(snapshot.countries, local, {
    posKeys: (c) => [c.isoCode2.toUpperCase()],
    localKeys: (c) => [c.isoCode2.toUpperCase()],
    toData: (c) => ({
      isoCode2: c.isoCode2.toUpperCase(),
      isoCode3: c.isoCode3.toUpperCase(),
      numericCode: c.numericCode,
      name: c.name,
      phoneCode: c.phoneCode,
      currency: c.currency,
      isActive: c.active,
    }),
  });
}

/** Departamentos: por código DANE dentro del país; adopta por nombre los de la web sin código. */
export function reconcileDepartments(
  snapshot: PosShippingSnapshot,
  local: LocalDepartment[],
  countryIdByIso: Map<string, string>,
) {
  const pos = snapshot.countries.flatMap((c) => {
    const countryId = countryIdByIso.get(c.isoCode2.toUpperCase());
    return countryId ? c.departments.map((d) => ({ ...d, countryId })) : [];
  });
  return reconcile(pos, local, {
    posKeys: (d) => [`dane:${d.countryId}|${d.daneCode}`, `name:${d.countryId}|${normalizeString(d.name)}`],
    localKeys: (d) => [
      ...(d.daneCode ? [`dane:${d.countryId}|${d.daneCode}`] : []),
      `name:${d.countryId}|${d.normalizedName}`,
    ],
    toData: (d) => ({
      countryId: d.countryId,
      daneCode: d.daneCode,
      name: d.name,
      normalizedName: normalizeString(d.name),
      isActive: d.active,
    }),
  });
}

/**
 * Municipios: por código DANE; adopta por nombre (dentro del departamento) los de la web sin código.
 * Sin tarifa propia en el POS → `shippingRateId = null` (usa la tarifa por defecto, igual que en la web).
 */
export function reconcileMunicipalities(
  snapshot: PosShippingSnapshot,
  local: LocalMunicipality[],
  departmentIdByKey: Map<string, string>,
  rateIdByPosId: Map<string, string>,
) {
  const pos = snapshot.countries.flatMap((c) =>
    c.departments.flatMap((d) => {
      const departmentId = departmentIdByKey.get(departmentKey(c.isoCode2, d.daneCode));
      return departmentId ? d.municipalities.map((m) => ({ ...m, departmentId })) : [];
    }),
  );
  return reconcile(pos, local, {
    posKeys: (m) => [`dane:${m.daneCode}`, `name:${m.departmentId}|${normalizeString(m.name)}`],
    localKeys: (m) => [...(m.daneCode ? [`dane:${m.daneCode}`] : []), `name:${m.departmentId}|${m.normalizedName}`],
    toData: (m) => ({
      departmentId: m.departmentId,
      daneCode: m.daneCode,
      name: m.name,
      normalizedName: normalizeString(m.name),
      shippingRateId: m.rateId ? (rateIdByPosId.get(m.rateId) ?? null) : null,
      isActive: m.active,
    }),
  });
}

export function departmentKey(countryIso: string, daneCode: string) {
  return `${countryIso.toUpperCase()}|${daneCode}`;
}

export function countMunicipalities(snapshot: PosShippingSnapshot) {
  return snapshot.countries.reduce(
    (total, c) => total + c.departments.reduce((sum, d) => sum + d.municipalities.length, 0),
    0,
  );
}
