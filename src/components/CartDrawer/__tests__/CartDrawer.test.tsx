import { render, screen, fireEvent } from "@testing-library/react";
import { CartDrawer } from "../index";

// Mocks
jest.mock("@/context/CartContext", () => ({
  useCart: jest.fn(),
}));

jest.mock("../hooks/useCartDrawer", () => ({
  useCartDrawer: jest.fn(),
}));

jest.mock("../components/CartOverlay", () => ({
  CartOverlay: ({ isOpen, onClose }: any) =>
    isOpen ? <div data-testid="overlay" onClick={onClose} /> : null,
}));

jest.mock("../components/CartPanel", () => ({
  CartPanel: ({ isOpen, children }: any) =>
    isOpen ? <div data-testid="panel">{children}</div> : null,
}));

jest.mock("../components/CartHeader", () => ({
  CartHeader: ({ cartCount, onClose }: any) => (
    <div data-testid="header">
      <span>{cartCount}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

jest.mock("../components/CartContent", () => ({
  CartContent: ({ items }: any) => (
    <div data-testid="content">
      {items.map((item: any) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  ),
}));

jest.mock("../components/CartFooter", () => ({
  CartFooter: ({ subtotal, itemCount }: any) =>
    itemCount > 0 ? (
      <div data-testid="footer">
        ${subtotal}
      </div>
    ) : null,
}));

import { useCartDrawer } from "../hooks/useCartDrawer";

describe("CartDrawer", () => {
  const mockCloseCart = jest.fn();
  const mockRemoveFromCart = jest.fn();
  const mockUpdateQuantity = jest.fn();

  const mockUseCartDrawerValue = {
    isOpen: true,
    closeCart: mockCloseCart,
    items: [
      {
        id: "item-1",
        name: "Test Product",
        price: 50000,
        image: "/img.jpg",
        color: "Blue",
        size: "M",
        quantity: 1,
      },
    ],
    removeFromCart: mockRemoveFromCart,
    updateQuantity: mockUpdateQuantity,
    subtotal: 50000,
    cartCount: 1,
    handleOverlayClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useCartDrawer as jest.Mock).mockReturnValue(mockUseCartDrawerValue);
  });

  it("no renderiza cuando isOpen es false", () => {
    (useCartDrawer as jest.Mock).mockReturnValue({
      ...mockUseCartDrawerValue,
      isOpen: false,
    });

    const { container } = render(<CartDrawer />);
    expect(container.firstChild?.childNodes.length).toBe(0);
  });

  it("renderiza cuando isOpen es true", () => {
    render(<CartDrawer />);

    expect(screen.getByTestId("overlay")).toBeInTheDocument();
    expect(screen.getByTestId("panel")).toBeInTheDocument();
  });

  it("renderiza CartHeader con cartCount", () => {
    render(<CartDrawer />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renderiza CartContent con items", () => {
    render(<CartDrawer />);

    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByText("Test Product")).toBeInTheDocument();
  });

  it("renderiza CartFooter cuando hay items", () => {
    render(<CartDrawer />);

    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("no renderiza CartFooter cuando no hay items", () => {
    (useCartDrawer as jest.Mock).mockReturnValue({
      ...mockUseCartDrawerValue,
      items: [],
    });

    const { queryByTestId } = render(<CartDrawer />);
    expect(queryByTestId("footer")).not.toBeInTheDocument();
  });

  it("tiene clase fixed inset-0 z-[100]", () => {
    const { container } = render(<CartDrawer />);
    const wrapper = container.querySelector(".fixed");
    expect(wrapper).toHaveClass("inset-0");
    expect(wrapper).toHaveClass("z-\\[100\\]");
  });
});
