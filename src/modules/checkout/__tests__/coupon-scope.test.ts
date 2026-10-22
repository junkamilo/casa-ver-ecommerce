/** @jest-environment node */
import {
  eligibleSubtotal,
  isProductInScope,
  isWholeOrder,
  minPurchaseMessage,
  type CouponScope,
} from "../domain/coupon-scope";

const products: CouponScope = { scopeType: "PRODUCTS", scopeProductIds: ["p-1"], scopeCategoryIds: [] };
const categories: CouponScope = { scopeType: "CATEGORIES", scopeProductIds: [], scopeCategoryIds: ["c-vestidos"] };

describe("alcance de cupones (B.9)", () => {
  it("los cupones sin alcance aplican a todo el pedido", () => {
    expect(isWholeOrder({ scopeType: "ORDER" })).toBe(true);
    expect(isWholeOrder(null)).toBe(true);
    expect(isProductInScope({ scopeType: "ORDER", scopeProductIds: [], scopeCategoryIds: [] }, "cualquiera")).toBe(true);
  });

  it("por productos solo aplica a esos productos", () => {
    expect(isProductInScope(products, "p-1")).toBe(true);
    expect(isProductInScope(products, "p-2")).toBe(false);
    expect(isProductInScope(products, null)).toBe(false);
  });

  it("por categorías incluye sus subcategorías", () => {
    expect(isProductInScope(categories, "p-1", [{ id: "c-vestidos", parentId: null }])).toBe(true);
    expect(isProductInScope(categories, "p-1", [{ id: "s-largos", parentId: "c-vestidos" }])).toBe(true);
    expect(isProductInScope(categories, "p-1", [{ id: "c-blusas", parentId: null }])).toBe(false);
  });

  it("la base del descuento es el subtotal de las líneas elegibles", () => {
    const lines = [
      { variantId: "v-1", productId: "p-1", price: 100000, quantity: 1 },
      { variantId: "v-2", productId: "p-2", price: 50000, quantity: 2 },
    ];
    expect(eligibleSubtotal(lines, new Set(["v-2"]))).toBe(100000);
    expect(eligibleSubtotal(lines, new Set())).toBe(0);
  });

  it("mensaje de compra mínima en pesos colombianos", () => {
    expect(minPurchaseMessage(100000)).toBe("Compra mínima de $100.000 para usar este cupón");
  });
});
