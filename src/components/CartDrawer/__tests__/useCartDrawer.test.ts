import { renderHook, act } from "@testing-library/react";
import { useCartDrawer } from "../hooks/useCartDrawer";

// Mock del contexto CartContext
jest.mock("@/context/CartContext", () => ({
  useCart: jest.fn(),
}));

import { useCart } from "@/context/CartContext";

describe("useCartDrawer", () => {
  const mockCloseCart = jest.fn();
  const mockRemoveFromCart = jest.fn();
  const mockUpdateQuantity = jest.fn();

  const mockCartContextValue = {
    isCartOpen: true,
    closeCart: mockCloseCart,
    items: [
      {
        id: "test-1",
        name: "Producto Test",
        price: 50000,
        image: "test.jpg",
        color: "Azul",
        size: "M",
        quantity: 2,
      },
    ],
    removeFromCart: mockRemoveFromCart,
    updateQuantity: mockUpdateQuantity,
    subtotal: 100000,
    cartCount: 2,
    addToCart: jest.fn(),
    openCart: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useCart as jest.Mock).mockReturnValue(mockCartContextValue);
  });

  it("retorna valores correctos del contexto", () => {
    const { result } = renderHook(() => useCartDrawer());

    expect(result.current.isOpen).toBe(true);
    expect(result.current.cartCount).toBe(2);
    expect(result.current.subtotal).toBe(100000);
    expect(result.current.items).toHaveLength(1);
  });

  it("cierra el carrito al llamar closeCart", () => {
    const { result } = renderHook(() => useCartDrawer());

    act(() => {
      result.current.closeCart();
    });

    expect(mockCloseCart).toHaveBeenCalled();
  });

  it("remueve un item del carrito", () => {
    const { result } = renderHook(() => useCartDrawer());

    act(() => {
      result.current.removeFromCart("test-1");
    });

    expect(mockRemoveFromCart).toHaveBeenCalledWith("test-1");
  });

  it("actualiza la cantidad de un producto", () => {
    const { result } = renderHook(() => useCartDrawer());

    act(() => {
      result.current.updateQuantity("test-1", 1);
    });

    expect(mockUpdateQuantity).toHaveBeenCalledWith("test-1", 1);
  });

  it("handleOverlayClick solo cierra si el target es el overlay mismo", () => {
    const { result } = renderHook(() => useCartDrawer());

    const mockEvent = {
      target: { className: "overlay" },
      currentTarget: { className: "overlay" },
    } as unknown as React.MouseEvent<HTMLDivElement>;

    act(() => {
      result.current.handleOverlayClick(mockEvent);
    });

    expect(mockCloseCart).toHaveBeenCalled();
  });

  it("no cierra si el click es en el panel", () => {
    const { result } = renderHook(() => useCartDrawer());
    mockCloseCart.mockClear();

    const mockEvent = {
      target: { className: "panel" },
      currentTarget: { className: "overlay" },
    } as unknown as React.MouseEvent<HTMLDivElement>;

    act(() => {
      result.current.handleOverlayClick(mockEvent);
    });

    expect(mockCloseCart).not.toHaveBeenCalled();
  });
});
