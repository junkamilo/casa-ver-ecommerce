import { render, screen, fireEvent } from "@testing-library/react";
import { CartDrawer } from "../index";
import { useCart } from "@/context/CartContext";

// Mocks
jest.mock("@/context/CartContext", () => ({
  useCart: jest.fn(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

describe("CartDrawer Integration Tests", () => {
  const mockCloseCart = jest.fn();
  const mockRemoveFromCart = jest.fn();
  const mockUpdateQuantity = jest.fn();

  const mockCartItems = [
    {
      id: "item-1",
      name: "Camiseta",
      price: 50000,
      image: "/camiseta.jpg",
      color: "Azul",
      size: "M",
      quantity: 1,
    },
    {
      id: "item-2",
      name: "Pantalón",
      price: 75000,
      image: "/pantalon.jpg",
      color: "Negro",
      size: "L",
      quantity: 2,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("muestra correctamente un carrito con múltiples items", () => {
    (useCart as jest.Mock).mockReturnValue({
      isCartOpen: true,
      closeCart: mockCloseCart,
      items: mockCartItems,
      removeFromCart: mockRemoveFromCart,
      updateQuantity: mockUpdateQuantity,
      subtotal: 200000,
      cartCount: 3,
      addToCart: jest.fn(),
      openCart: jest.fn(),
    });

    render(<CartDrawer />);

    // Verifica que ambos items se renderizan
    expect(screen.getByText("Camiseta")).toBeInTheDocument();
    expect(screen.getByText("Pantalón")).toBeInTheDocument();

    // Verifica el count en el header
    expect(screen.getByText("3")).toBeInTheDocument();

    // Verifica el subtotal
    expect(screen.getByText("$200,000 COP")).toBeInTheDocument();
  });

  it("muestra estado vacío cuando no hay items", () => {
    (useCart as jest.Mock).mockReturnValue({
      isCartOpen: true,
      closeCart: mockCloseCart,
      items: [],
      removeFromCart: mockRemoveFromCart,
      updateQuantity: mockUpdateQuantity,
      subtotal: 0,
      cartCount: 0,
      addToCart: jest.fn(),
      openCart: jest.fn(),
    });

    render(<CartDrawer />);

    // Verifica que muestra el estado vacío
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
    expect(screen.getByText("Seguir comprando")).toBeInTheDocument();

    // Verifica que no muestra el footer
    expect(screen.queryByText(/Total estimado/)).not.toBeInTheDocument();
  });

  it("permite aumentar cantidad de un item", () => {
    (useCart as jest.Mock).mockReturnValue({
      isCartOpen: true,
      closeCart: mockCloseCart,
      items: [mockCartItems[0]],
      removeFromCart: mockRemoveFromCart,
      updateQuantity: mockUpdateQuantity,
      subtotal: 50000,
      cartCount: 1,
      addToCart: jest.fn(),
      openCart: jest.fn(),
    });

    render(<CartDrawer />);

    const increaseButtons = screen.getAllByLabelText("Aumentar cantidad");
    fireEvent.click(increaseButtons[0]);

    expect(mockUpdateQuantity).toHaveBeenCalledWith("item-1", 1);
  });

  it("permite disminuir cantidad de un item", () => {
    (useCart as jest.Mock).mockReturnValue({
      isCartOpen: true,
      closeCart: mockCloseCart,
      items: [{ ...mockCartItems[0], quantity: 2 }],
      removeFromCart: mockRemoveFromCart,
      updateQuantity: mockUpdateQuantity,
      subtotal: 100000,
      cartCount: 2,
      addToCart: jest.fn(),
      openCart: jest.fn(),
    });

    render(<CartDrawer />);

    const decreaseButtons = screen.getAllByLabelText("Disminuir cantidad");
    fireEvent.click(decreaseButtons[0]);

    expect(mockUpdateQuantity).toHaveBeenCalledWith("item-1", -1);
  });

  it("permite eliminar un item del carrito", () => {
    (useCart as jest.Mock).mockReturnValue({
      isCartOpen: true,
      closeCart: mockCloseCart,
      items: mockCartItems,
      removeFromCart: mockRemoveFromCart,
      updateQuantity: mockUpdateQuantity,
      subtotal: 200000,
      cartCount: 3,
      addToCart: jest.fn(),
      openCart: jest.fn(),
    });

    render(<CartDrawer />);

    const removeButtons = screen.getAllByLabelText("Eliminar producto");
    fireEvent.click(removeButtons[0]);

    expect(mockRemoveFromCart).toHaveBeenCalledWith("item-1");
  });

  it("cierra el carrito al hacer click en el botón X", () => {
    (useCart as jest.Mock).mockReturnValue({
      isCartOpen: true,
      closeCart: mockCloseCart,
      items: mockCartItems,
      removeFromCart: mockRemoveFromCart,
      updateQuantity: mockUpdateQuantity,
      subtotal: 200000,
      cartCount: 3,
      addToCart: jest.fn(),
      openCart: jest.fn(),
    });

    render(<CartDrawer />);

    const closeButton = screen.getByLabelText("Cerrar carrito");
    fireEvent.click(closeButton);

    expect(mockCloseCart).toHaveBeenCalled();
  });

  it("el botón Pagar navega a /checkout y cierra el carrito", () => {
    (useCart as jest.Mock).mockReturnValue({
      isCartOpen: true,
      closeCart: mockCloseCart,
      items: mockCartItems,
      removeFromCart: mockRemoveFromCart,
      updateQuantity: mockUpdateQuantity,
      subtotal: 200000,
      cartCount: 3,
      addToCart: jest.fn(),
      openCart: jest.fn(),
    });

    render(<CartDrawer />);

    const payButton = screen.getByText("Pagar");
    expect(payButton).toHaveAttribute("href", "/checkout");

    fireEvent.click(payButton);
    expect(mockCloseCart).toHaveBeenCalled();
  });

  it("calcular correctamente el precio total de items", () => {
    (useCart as jest.Mock).mockReturnValue({
      isCartOpen: true,
      closeCart: mockCloseCart,
      items: [
        {
          id: "item-1",
          name: "Producto",
          price: 50000,
          image: "/img.jpg",
          color: "Color",
          size: "S",
          quantity: 3,
        },
      ],
      removeFromCart: mockRemoveFromCart,
      updateQuantity: mockUpdateQuantity,
      subtotal: 150000,
      cartCount: 3,
      addToCart: jest.fn(),
      openCart: jest.fn(),
    });

    render(<CartDrawer />);

    // Verifica el precio total (50000 * 3 = 150000)
    expect(screen.getByText("$150,000")).toBeInTheDocument();
  });

  it("no renderiza nada cuando el carrito está cerrado", () => {
    (useCart as jest.Mock).mockReturnValue({
      isCartOpen: false,
      closeCart: mockCloseCart,
      items: mockCartItems,
      removeFromCart: mockRemoveFromCart,
      updateQuantity: mockUpdateQuantity,
      subtotal: 200000,
      cartCount: 3,
      addToCart: jest.fn(),
      openCart: jest.fn(),
    });

    const { container } = render(<CartDrawer />);
    expect(container.firstChild?.childNodes.length).toBe(0);
  });
});
