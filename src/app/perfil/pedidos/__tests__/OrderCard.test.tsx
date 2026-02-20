import { render, screen, fireEvent } from "@testing-library/react";
import { OrderCard } from "../components/OrderCard";
import { Order } from "../types";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const mockOrder: Order = {
  id: "ord_001",
  orderNumber: "CV-2024-001",
  status: "DELIVERED",
  createdAt: "2024-11-15T10:30:00Z",
  updatedAt: "2024-11-20T14:00:00Z",
  total: 285000,
  trackingCode: "TCC123456789",
  shippingAddress: {
    fullName: "Juan Pérez",
    address: "Calle 85 # 15-23 Apto 401",
    city: "Bogotá",
    department: "Cundinamarca",
  },
  items: [
    {
      id: "item_001",
      productName: "Camiseta Lino Premium Verde",
      productImage: "/img/camiseta.jpg",
      color: "Verde Bosque",
      size: "M",
      quantity: 2,
      unitPrice: 85000,
    },
  ],
};

describe("OrderCard", () => {
  it("muestra el número de pedido", () => {
    render(<OrderCard order={mockOrder} isExpanded={false} onToggle={jest.fn()} />);
    expect(screen.getByText("CV-2024-001")).toBeInTheDocument();
  });

  it("muestra el badge de estado", () => {
    render(<OrderCard order={mockOrder} isExpanded={false} onToggle={jest.fn()} />);
    expect(screen.getByText("Entregado")).toBeInTheDocument();
  });

  it("muestra el precio total", () => {
    render(<OrderCard order={mockOrder} isExpanded={false} onToggle={jest.fn()} />);
    // El precio se muestra en la cabecera en pantallas sm+
    const priceElements = screen.getAllByText(/285\.000/);
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it("llama onToggle al hacer click en el header", () => {
    const onToggle = jest.fn();
    render(<OrderCard order={mockOrder} isExpanded={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onToggle).toHaveBeenCalled();
  });

  it("no muestra el detalle cuando isExpanded es false", () => {
    render(<OrderCard order={mockOrder} isExpanded={false} onToggle={jest.fn()} />);
    expect(screen.queryByText("Camiseta Lino Premium Verde")).not.toBeInTheDocument();
  });

  it("muestra los items del pedido cuando está expandido", () => {
    render(<OrderCard order={mockOrder} isExpanded={true} onToggle={jest.fn()} />);
    expect(screen.getByText("Camiseta Lino Premium Verde")).toBeInTheDocument();
  });

  it("muestra la dirección de envío cuando está expandido", () => {
    render(<OrderCard order={mockOrder} isExpanded={true} onToggle={jest.fn()} />);
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText(/Bogotá/)).toBeInTheDocument();
  });

  it("muestra el código de seguimiento cuando está expandido", () => {
    render(<OrderCard order={mockOrder} isExpanded={true} onToggle={jest.fn()} />);
    expect(screen.getByText("TCC123456789")).toBeInTheDocument();
  });

  it("no muestra el código de seguimiento si no existe", () => {
    const orderWithoutTracking = { ...mockOrder, trackingCode: undefined };
    render(<OrderCard order={orderWithoutTracking} isExpanded={true} onToggle={jest.fn()} />);
    expect(screen.queryByText("Código de seguimiento")).not.toBeInTheDocument();
  });

  it("el botón tiene aria-expanded correcto", () => {
    const { rerender } = render(
      <OrderCard order={mockOrder} isExpanded={false} onToggle={jest.fn()} />
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");

    rerender(<OrderCard order={mockOrder} isExpanded={true} onToggle={jest.fn()} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });
});
