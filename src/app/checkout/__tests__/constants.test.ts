import { SHIPPING_COST, LOCALE } from "../constants/constants";

describe("checkout constants", () => {
  it("SHIPPING_COST is 18000", () => {
    expect(SHIPPING_COST).toBe(18000);
  });

  it("LOCALE is es-CO", () => {
    expect(LOCALE).toBe("es-CO");
  });
});
