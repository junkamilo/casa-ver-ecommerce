/** @jest-environment node */
import { posWebhookPayloadSchema } from "../contracts/pos-catalog.schema";
import { posShippingSnapshotSchema } from "../contracts/pos-shipping.schema";
import {
  countMunicipalities,
  departmentKey,
  reconcileCountries,
  reconcileDepartments,
  reconcileMunicipalities,
  reconcileRates,
  type LocalMunicipality,
  type LocalShippingRate,
} from "../domain/pos-shipping-reconcile";

const POS_NATIONAL = "093e8630-32e0-40ca-a327-ea4e948bc833";
const POS_METRO = "99ddb123-c1ac-48e7-957a-6a4c23cdbf7d";

function snapshot() {
  return posShippingSnapshotSchema.parse({
    config: { freeShippingThreshold: 350000, defaultRateId: POS_NATIONAL },
    rates: [
      { rateId: POS_NATIONAL, name: "Tarifa Nacional", price: 20000, active: true },
      { rateId: POS_METRO, name: null, price: 9000, active: true },
    ],
    countries: [
      {
        isoCode2: "CO",
        isoCode3: "COL",
        numericCode: "170",
        name: "Colombia",
        phoneCode: "+57",
        currency: "COP",
        active: true,
        departments: [
          {
            daneCode: "68",
            name: "Santander",
            active: true,
            municipalities: [
              { daneCode: "68001", name: "Bucaramanga", active: true, rateId: POS_METRO },
              { daneCode: "68276", name: "Floridablanca", active: true, rateId: null },
            ],
          },
        ],
      },
    ],
    updatedAt: "2026-10-15T16:11:36Z",
  });
}

const rate = (overrides: Partial<LocalShippingRate>): LocalShippingRate => ({
  id: "web-rate",
  posRateId: null,
  name: null,
  price: 0,
  isActive: true,
  ...overrides,
});

describe("contratos de envíos", () => {
  it("acepta el aviso shipping.upserted", () => {
    const parsed = posWebhookPayloadSchema.safeParse({
      eventId: "e1",
      event: "shipping.upserted",
      entityType: "shipping",
      id: "shipping",
      action: "upserted",
    });
    expect(parsed.success).toBe(true);
  });

  it("cuenta los municipios de la foto", () => {
    expect(countMunicipalities(snapshot())).toBe(2);
  });
});

describe("reconcileRates", () => {
  it("adopta por nombre y precio las tarifas de la web sin enlazar y crea las nuevas", () => {
    const result = reconcileRates(snapshot().rates, [
      rate({ id: "w-nacional", name: "tarifa nacional ", price: 20000 }),
      rate({ id: "w-vieja", name: "Regional Sur", price: 15000 }),
    ]);
    expect(result.updates).toEqual([
      { id: "w-nacional", data: { posRateId: POS_NATIONAL, name: "Tarifa Nacional" } },
    ]);
    expect(result.creates).toEqual([{ posRateId: POS_METRO, name: null, price: 9000, isActive: true }]);
    expect(result.missing.map((r) => r.id)).toEqual(["w-vieja"]);
  });

  it("enlazada por posRateId: solo actualiza lo que cambió", () => {
    const result = reconcileRates(snapshot().rates, [
      rate({ id: "a", posRateId: POS_NATIONAL, name: "Tarifa Nacional", price: 19000 }),
      rate({ id: "b", posRateId: POS_METRO, price: 9000 }),
    ]);
    expect(result.updates).toEqual([{ id: "a", data: { price: 20000 } }]);
    expect(result.creates).toHaveLength(0);
    expect(result.missing).toHaveLength(0);
  });

  it("no adopta por nombre una tarifa ya enlazada a otra del POS", () => {
    const result = reconcileRates(snapshot().rates, [
      rate({ id: "a", posRateId: "otra", name: "Tarifa Nacional", price: 20000 }),
    ]);
    expect(result.creates).toHaveLength(2);
    expect(result.missing.map((r) => r.id)).toEqual(["a"]);
  });
});

describe("geografía", () => {
  it("países por ISO, sin cambios no actualiza", () => {
    const result = reconcileCountries(snapshot(), [
      {
        id: "co",
        isoCode2: "CO",
        isoCode3: "COL",
        numericCode: "170",
        name: "Colombia",
        phoneCode: "+57",
        currency: "COP",
        isActive: true,
      },
    ]);
    expect(result).toEqual({ creates: [], updates: [], missing: [] });
  });

  it("departamentos: adopta por nombre el que no tiene código DANE", () => {
    const result = reconcileDepartments(
      snapshot(),
      [{ id: "d1", countryId: "co", daneCode: null, name: "Santander", normalizedName: "santander", isActive: true }],
      new Map([["CO", "co"]]),
    );
    expect(result.updates).toEqual([{ id: "d1", data: { daneCode: "68" } }]);
    expect(result.creates).toHaveLength(0);
  });

  it("municipios: tarifa mapeada al id local, null = tarifa por defecto, faltantes sin pareja", () => {
    const local: LocalMunicipality[] = [
      { id: "m1", departmentId: "d1", daneCode: "68001", name: "Bucaramanga", normalizedName: "bucaramanga", shippingRateId: null, isActive: true },
      { id: "m2", departmentId: "d1", daneCode: "68276", name: "Floridablanca", normalizedName: "floridablanca", shippingRateId: "w-metro", isActive: true },
      { id: "m3", departmentId: "d1", daneCode: "68999", name: "Fantasma", normalizedName: "fantasma", shippingRateId: null, isActive: true },
    ];
    const result = reconcileMunicipalities(
      snapshot(),
      local,
      new Map([[departmentKey("co", "68"), "d1"]]),
      new Map([[POS_METRO, "w-metro"]]),
    );
    expect(result.updates).toEqual([
      { id: "m1", data: { shippingRateId: "w-metro" } },
      { id: "m2", data: { shippingRateId: null } },
    ]);
    expect(result.creates).toHaveLength(0);
    expect(result.missing.map((m) => m.id)).toEqual(["m3"]);
  });
});
