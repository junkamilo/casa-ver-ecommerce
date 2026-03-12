import { render, screen, fireEvent } from "@testing-library/react";
import { PedidoDetailModal } from "../components/PedidoDetailModal";
import type { Order } from "../types";

jest.mock("@/app/actions/orders", () => ({
  updateOrderStatus: jest.fn().mockResolvedValue(undefined),
}));

const mockOrder: Order = {
  id: "ORD-2024-001",
  customer: "María García",
  email: "maria@example.com",
  phone: "3001234567",
  items: [
    { name: "Enterizo Floral", qty: 1, price: 89900 },
    { name: "Blusa Casual", qty: 2, price: 45000 },
  ],
  total: 179900,
  status: "Pagado",
  paymentMethod: "Bold",
  date: "2024-12-15",
  address: "Calle 123 # 45-67, Bogotá",
};

describe("PedidoDetailModal", () => {
  it("muestra el título 'Detalle del Pedido'", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getByText("Detalle del Pedido")).toBeInTheDocument();
  });

  it("muestra el ID del pedido en el header", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getByText(`ID: ${mockOrder.id}`)).toBeInTheDocument();
  });

  it("muestra la sección 'Datos del Cliente'", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getByText("Datos del Cliente")).toBeInTheDocument();
  });

  it("muestra el nombre del cliente", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getByText(mockOrder.customer)).toBeInTheDocument();
  });

  it("muestra el email del cliente", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getByText(mockOrder.email)).toBeInTheDocument();
  });

  it("muestra el teléfono del cliente", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getByText(mockOrder.phone)).toBeInTheDocument();
  });

  it("muestra la sección 'Envío y Pago'", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getByText("Envío y Pago")).toBeInTheDocument();
  });

  it("muestra la dirección de entrega", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getByText(mockOrder.address)).toBeInTheDocument();
  });

  it("muestra el método de pago", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getAllByText(mockOrder.paymentMethod).length).toBeGreaterThan(0);
  });

  it("muestra la fecha del pedido", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getByText(mockOrder.date)).toBeInTheDocument();
  });

  it("muestra el estado del pedido", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getAllByText(mockOrder.status).length).toBeGreaterThan(0);
  });

  it("muestra la sección 'Resumen de Compra'", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getByText("Resumen de Compra")).toBeInTheDocument();
  });

  it("muestra el nombre de cada item del pedido", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    mockOrder.items.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
    });
  });

  it("muestra el texto 'Total a Pagar'", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getByText("Total a Pagar")).toBeInTheDocument();
  });

  it("muestra el botón 'Descargar PDF'", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getByText("Descargar PDF")).toBeInTheDocument();
  });

  it("muestra el botón 'Cerrar'", () => {
    render(<PedidoDetailModal order={mockOrder} onClose={jest.fn()} onStatusUpdated={jest.fn()} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("llama a onClose al hacer click en el botón 'Cerrar'", () => {
    const onClose = jest.fn();
    render(<PedidoDetailModal order={mockOrder} onClose={onClose} onStatusUpdated={jest.fn()} />);
    fireEvent.click(screen.getByText("Cerrar"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("llama a onClose al hacer click en el ícono X del header", () => {
    const onClose = jest.fn();
    render(<PedidoDetailModal order={mockOrder} onClose={onClose} onStatusUpdated={jest.fn()} />);
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
