import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { PosShippingSnapshot } from "../contracts/pos-shipping.schema";
import {
  departmentKey,
  reconcileCountries,
  reconcileDepartments,
  reconcileMunicipalities,
  reconcileRates,
} from "../domain/pos-shipping-reconcile";

/** Actualizaciones por transacción: el primer enlace puede tocar los ~1.100 municipios. */
const UPDATE_CHUNK = 200;

export type PosShippingCounts = { created: number; updated: number; removed: number };

export type PosShippingSyncCounts = {
  rates: PosShippingCounts;
  countries: PosShippingCounts;
  departments: PosShippingCounts;
  municipalities: PosShippingCounts;
  configChanged: boolean;
};

const empty = (): PosShippingCounts => ({ created: 0, updated: 0, removed: 0 });

async function runUpdates(ops: Prisma.PrismaPromise<unknown>[]) {
  for (let i = 0; i < ops.length; i += UPDATE_CHUNK) {
    await prisma.$transaction(ops.slice(i, i + UPDATE_CHUNK));
  }
}

/**
 * Copia de solo lectura de envíos del POS: tarifas (por posRateId), países (ISO), departamentos y
 * municipios (DANE) y la configuración. Solo escribe lo que cambió. Lo que el POS ya no publica se
 * desactiva (geografía) o se borra (tarifas sin uso); nunca se borra geografía.
 */
export class PrismaPosShippingRepository {
  async applySnapshot(snapshot: PosShippingSnapshot): Promise<PosShippingSyncCounts> {
    const counts: PosShippingSyncCounts = {
      rates: empty(),
      countries: empty(),
      departments: empty(),
      municipalities: empty(),
      configChanged: false,
    };

    // 1. Tarifas
    const rates = reconcileRates(snapshot.rates, await prisma.shippingRate.findMany());
    if (rates.creates.length > 0) await prisma.shippingRate.createMany({ data: rates.creates });
    await runUpdates(rates.updates.map(({ id, data }) => prisma.shippingRate.update({ where: { id }, data })));
    counts.rates.created = rates.creates.length;
    counts.rates.updated = rates.updates.length;
    const rateIdByPosId = new Map(
      (await prisma.shippingRate.findMany({ where: { posRateId: { not: null } }, select: { id: true, posRateId: true } }))
        .map((r) => [r.posRateId as string, r.id]),
    );

    // 2. Países
    const countries = reconcileCountries(snapshot, await prisma.country.findMany());
    if (countries.creates.length > 0) await prisma.country.createMany({ data: countries.creates });
    await runUpdates(countries.updates.map(({ id, data }) => prisma.country.update({ where: { id }, data })));
    const countryRows = await prisma.country.findMany({ select: { id: true, isoCode2: true } });
    const countryIdByIso = new Map(countryRows.map((c) => [c.isoCode2.toUpperCase(), c.id]));
    counts.countries = {
      created: countries.creates.length,
      updated: countries.updates.length,
      removed: await deactivate("country", countries.missing),
    };

    // 3. Departamentos
    const departments = reconcileDepartments(snapshot, await prisma.department.findMany(), countryIdByIso);
    if (departments.creates.length > 0) await prisma.department.createMany({ data: departments.creates });
    await runUpdates(departments.updates.map(({ id, data }) => prisma.department.update({ where: { id }, data })));
    const isoByCountryId = new Map(countryRows.map((c) => [c.id, c.isoCode2]));
    const departmentIdByKey = new Map(
      (await prisma.department.findMany({ where: { daneCode: { not: null } }, select: { id: true, countryId: true, daneCode: true } }))
        .filter((d) => isoByCountryId.has(d.countryId))
        .map((d) => [departmentKey(isoByCountryId.get(d.countryId)!, d.daneCode!), d.id]),
    );
    counts.departments = {
      created: departments.creates.length,
      updated: departments.updates.length,
      removed: await deactivate("department", departments.missing),
    };

    // 4. Municipios
    const municipalities = reconcileMunicipalities(
      snapshot,
      await prisma.municipality.findMany(),
      departmentIdByKey,
      rateIdByPosId,
    );
    if (municipalities.creates.length > 0) await prisma.municipality.createMany({ data: municipalities.creates });
    await runUpdates(municipalities.updates.map(({ id, data }) => prisma.municipality.update({ where: { id }, data })));
    counts.municipalities = {
      created: municipalities.creates.length,
      updated: municipalities.updates.length,
      removed: await deactivate("municipality", municipalities.missing),
    };

    // 5. Configuración (antes de borrar tarifas: la tarifa por defecto anterior puede ser una de ellas)
    const defaultRateId = snapshot.config.defaultRateId ? (rateIdByPosId.get(snapshot.config.defaultRateId) ?? null) : null;
    const config = await prisma.shippingConfig.findUnique({ where: { id: "singleton" } });
    if (
      !config ||
      config.freeShippingThreshold !== snapshot.config.freeShippingThreshold ||
      config.defaultRateId !== defaultRateId
    ) {
      await prisma.shippingConfig.upsert({
        where: { id: "singleton" },
        create: { id: "singleton", freeShippingThreshold: snapshot.config.freeShippingThreshold, defaultRateId },
        update: { freeShippingThreshold: snapshot.config.freeShippingThreshold, defaultRateId },
      });
      counts.configChanged = true;
    }

    // 6. Tarifas que el POS ya no tiene (o copias de la web que no se adoptaron): los municipios
    // que aún las usen quedan con la tarifa por defecto (onDelete: SetNull).
    const staleRateIds = rates.missing.map((r) => r.id).filter((id) => id !== defaultRateId);
    if (staleRateIds.length > 0) {
      counts.rates.removed = (await prisma.shippingRate.deleteMany({ where: { id: { in: staleRateIds } } })).count;
    }

    return counts;
  }
}

async function deactivate(
  model: "country" | "department" | "municipality",
  missing: { id: string; isActive: boolean }[],
): Promise<number> {
  const ids = missing.filter((row) => row.isActive).map((row) => row.id);
  if (ids.length === 0) return 0;
  const where = { id: { in: ids } };
  const data = { isActive: false };
  const result =
    model === "country"
      ? await prisma.country.updateMany({ where, data })
      : model === "department"
        ? await prisma.department.updateMany({ where, data })
        : await prisma.municipality.updateMany({ where, data });
  return result.count;
}
