/** @jest-environment node */
jest.mock("server-only", () => ({}));
jest.mock("@/modules/posIntegration/infrastructure/pos-catalog.client", () => ({
  isPosCatalogConfigured: jest.fn(() => true),
  quotePosShipping: jest.fn(),
  listPosDepartments: jest.fn(),
  listPosMunicipalities: jest.fn(),
}));

import {
  listPosDepartments,
  listPosMunicipalities,
  quotePosShipping,
} from "@/modules/posIntegration/infrastructure/pos-catalog.client";
import {
  clearShippingCache,
  listMunicipalityNames,
  quoteCheckoutShipping,
} from "../application/pos-shipping";

const mockQuote = quotePosShipping as jest.Mock;
const mockDepartments = listPosDepartments as jest.Mock;
const mockMunicipalities = listPosMunicipalities as jest.Mock;

function quote(overrides: Record<string, unknown> = {}) {
  return {
    ok: true, reason: null, cost: 9000, baseCost: 9000, rateName: "Metropolitana Bucaramanga", zoneRate: true,
    freeShippingThreshold: 350000, freeByThreshold: false, freeShippingActive: true, ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  clearShippingCache();
});

describe("envíos desde el POS", () => {
  it("el checkout cobra lo que cotiza el POS para la dirección", async () => {
    mockQuote.mockResolvedValue(quote());
    const result = await quoteCheckoutShipping({ cityName: "Bucaramanga", departmentName: "Santander", subtotalNeto: 180000 });
    expect(mockQuote).toHaveBeenCalledWith({ city: "Bucaramanga", department: "Santander", subtotal: 180000 });
    expect(result).toEqual(expect.objectContaining({ cost: 9000, baseCost: 9000, isPendingAddress: false, freeShippingThreshold: 350000 }));
  });

  it("sin cobertura el envío queda pendiente y marcado sin cobertura", async () => {
    mockQuote.mockResolvedValueOnce(quote({ ok: false, reason: "SIN_COBERTURA", cost: null, baseCost: null }));
    mockQuote.mockResolvedValueOnce(quote({ ok: false, reason: "SIN_COBERTURA", cost: null, baseCost: null }));
    const result = await quoteCheckoutShipping({ cityName: "Mitú", departmentName: "Vaupés", subtotalNeto: 100000 });
    expect(result.isPendingAddress).toBe(true);
    expect(result.noCoverage).toBe(true);
  });

  it("con el envío gratis pausado no se anuncia ni se aplica", async () => {
    mockQuote.mockResolvedValue(quote({ ok: false, cost: null, baseCost: null, freeShippingActive: false }));
    const result = await quoteCheckoutShipping({ subtotalNeto: 900000 });
    expect(result.isFreeByThreshold).toBe(false);
    expect(result.freeShippingThreshold).toBe(0);
  });

  it("sin dirección anticipa el envío gratis con las condiciones del POS", async () => {
    mockQuote.mockResolvedValue(quote({ ok: false, cost: null, baseCost: null }));
    const result = await quoteCheckoutShipping({ subtotalNeto: 400000 });
    expect(result.isPendingAddress).toBe(true);
    expect(result.isFreeByThreshold).toBe(true);
  });

  it("los municipios se buscan por el nombre del departamento, sin tildes ni mayúsculas", async () => {
    mockDepartments.mockResolvedValue([{ code: "68", name: "Santander" }, { code: "05", name: "Antioquia" }]);
    mockMunicipalities.mockResolvedValue([{ code: "68307", name: "Girón" }, { code: "68001", name: "Bucaramanga" }]);
    await expect(listMunicipalityNames("SANTANDER")).resolves.toEqual(["Bucaramanga", "Girón"]);
    expect(mockMunicipalities).toHaveBeenCalledWith("68");
    await expect(listMunicipalityNames("Bolívar")).resolves.toEqual([]);
  });
});
