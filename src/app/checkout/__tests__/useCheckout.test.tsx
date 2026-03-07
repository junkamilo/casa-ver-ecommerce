import { renderHook, act } from "@testing-library/react";
import { useCheckout } from "../hooks/useCheckout";
import { SHIPPING_COST } from "../constants/constants";

const mockItems = [
  { id: "1", name: "Producto A", price: 50000, image: "/a.jpg", color: "Verde", size: "M", quantity: 2 },
];

jest.mock("@/context/CartContext", () => ({
  useCart: () => ({
    items: mockItems,
    subtotal: 100000,
  }),
}));

describe("useCheckout", () => {
  it("returns items and subtotal from cart", () => {
    const { result } = renderHook(() => useCheckout());
    expect(result.current.items).toEqual(mockItems);
    expect(result.current.subtotal).toBe(100000);
  });

  it("returns correct shippingCost", () => {
    const { result } = renderHook(() => useCheckout());
    expect(result.current.shippingCost).toBe(SHIPPING_COST);
  });

  it("calculates total as subtotal + shippingCost", () => {
    const { result } = renderHook(() => useCheckout());
    expect(result.current.total).toBe(100000 + SHIPPING_COST);
  });

  it("billingSameAsShipping defaults to true", () => {
    const { result } = renderHook(() => useCheckout());
    expect(result.current.billingSameAsShipping).toBe(true);
  });

  it("setBillingSameAsShipping updates the value", () => {
    const { result } = renderHook(() => useCheckout());
    act(() => {
      result.current.setBillingSameAsShipping(false);
    });
    expect(result.current.billingSameAsShipping).toBe(false);
  });
});
