/** @jest-environment node */
import {
  minPurchaseMessage,
} from "../domain/coupon-scope";


describe("compra mínima del cupón", () => {




  it("mensaje de compra mínima en pesos colombianos", () => {
    expect(minPurchaseMessage(100000)).toBe("Compra mínima de $100.000 para usar este cupón");
  });
});
