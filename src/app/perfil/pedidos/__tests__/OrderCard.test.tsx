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
    render(<OrderCard order={mockOrder} onOpenDetail={jest.fn()} />);
    expect(screen.getByText("CV-2024-001")).toBeInTheDocument();
  });

  it("muestra el badge de estado", () => {
    render(<OrderCard order={mockOrder} onOpenDetail={jest.fn()} />);
    expect(screen.getByText("Entregado")).toBeInTheDocument();
  });

  it("muestra el precio total", () => {
    render(<OrderCard order={mockOrder} onOpenDetail={jest.fn()} />);
    const priceElements = screen.getAllByText(/285\.000/);
    expect(priceElements.length).toBeGreaterThan(0);
  });

  it("muestra la cantidad de ítems", () => {
    render(<OrderCard order={mockOrder} onOpenDetail={jest.fn()} />);
    expect(screen.getByText(/1 ítem/)).toBeInTheDocument();
  });

  it("llama onOpenDetail al hacer click en el botón de ojo", () => {
    const onOpenDetail = jest.fn();
    render(<OrderCard order={mockOrder} onOpenDetail={onOpenDetail} />);
    fireEvent.click(screen.getByRole("button", { name: /ver detalle/i }));
    expect(onOpenDetail).toHaveBeenCalledWith(mockOrder);
  });

  it("no muestra el detalle del pedido inline (usa modal)", () => {
    render(<OrderCard order={mockOrder} onOpenDetail={jest.fn()} />);
    expect(screen.queryByText("Camiseta Lino Premium Verde")).not.toBeInTheDocument();
    expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument();
  });
});
