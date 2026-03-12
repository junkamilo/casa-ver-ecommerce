import { render, screen, fireEvent } from "@testing-library/react";
import { PedidosMobileList } from "../components/PedidosMobileList";
import type { Order } from "../types";

const mockOrders: Order[] = [
  {
    id: "ORD-2024-001",
    customer: "María García",
    email: "maria@example.com",
    phone: "3001234567",
    items: [{ name: "Enterizo Floral", qty: 1, price: 89900 }],
    total: 89900,
    status: "Pagado",
    paymentMethod: "Bold",
    date: "2024-12-15",
    address: "Calle 123 # 45-67, Bogotá",
  },
  {
    id: "ORD-2024-002",
    customer: "Carlos López",
    email: "carlos@example.com",
    phone: "3109876543",
    items: [{ name: "Blusa Casual", qty: 2, price: 45000 }],
    total: 90000,
    status: "Pendiente",
    paymentMethod: "Nequi",
    date: "2024-12-16",
    address: "Carrera 50 # 10-20, Medellín",
  },
];

const defaultProps = {
  orders: mockOrders,
  expandedOrder: null,
  onToggleExpand: jest.fn(),
  onViewDetail: jest.fn(),
};

describe("PedidosMobileList", () => {
  it("renderiza los IDs de los pedidos", () => {
    render(<PedidosMobileList {...defaultProps} />);
    mockOrders.forEach((o) => {
      expect(screen.getByText(o.id)).toBeInTheDocument();
    });
  });

  it("renderiza los nombres de los clientes", () => {
    render(<PedidosMobileList {...defaultProps} />);
    mockOrders.forEach((o) => {
      expect(screen.getByText(o.customer)).toBeInTheDocument();
    });
  });

  it("muestra el estado de cada pedido", () => {
    render(<PedidosMobileList {...defaultProps} />);
    mockOrders.forEach((o) => {
      expect(screen.getByText(o.status)).toBeInTheDocument();
    });
  });

  it("muestra la fecha del pedido", () => {
    render(<PedidosMobileList {...defaultProps} />);
    expect(screen.getByText(mockOrders[0].date)).toBeInTheDocument();
  });

  it("llama a onToggleExpand al hacer click en un pedido", () => {
    const onToggleExpand = jest.fn();
    render(<PedidosMobileList {...defaultProps} onToggleExpand={onToggleExpand} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onToggleExpand).toHaveBeenCalledTimes(1);
  });

  it("pasa null a onToggleExpand cuando el pedido ya está expandido", () => {
    const onToggleExpand = jest.fn();
    render(
      <PedidosMobileList
        {...defaultProps}
        expandedOrder={mockOrders[0].id}
        onToggleExpand={onToggleExpand}
      />
    );
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onToggleExpand).toHaveBeenCalledWith(null);
  });

  it("pasa el ID a onToggleExpand cuando el pedido está colapsado", () => {
    const onToggleExpand = jest.fn();
    render(<PedidosMobileList {...defaultProps} onToggleExpand={onToggleExpand} />);
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onToggleExpand).toHaveBeenCalledWith(mockOrders[0].id);
  });

  it("no muestra el detalle cuando expandedOrder es null", () => {
    render(<PedidosMobileList {...defaultProps} expandedOrder={null} />);
    expect(screen.queryByText("Ver Factura Completa")).not.toBeInTheDocument();
  });

  it("muestra el detalle expandido cuando expandedOrder coincide con el ID", () => {
    render(
      <PedidosMobileList {...defaultProps} expandedOrder={mockOrders[0].id} />
    );
    expect(screen.getByText("Ver Factura Completa")).toBeInTheDocument();
  });

  it("muestra la sección 'Items' en el panel expandido", () => {
    render(
      <PedidosMobileList {...defaultProps} expandedOrder={mockOrders[0].id} />
    );
    expect(screen.getByText("Items")).toBeInTheDocument();
  });

  it("muestra el método de pago en el panel expandido", () => {
    render(
      <PedidosMobileList {...defaultProps} expandedOrder={mockOrders[0].id} />
    );
    expect(screen.getByText(mockOrders[0].paymentMethod)).toBeInTheDocument();
  });

  it("llama a onViewDetail al hacer click en 'Ver Factura Completa'", () => {
    const onViewDetail = jest.fn();
    render(
      <PedidosMobileList
        {...defaultProps}
        expandedOrder={mockOrders[0].id}
        onViewDetail={onViewDetail}
      />
    );
    fireEvent.click(screen.getByText("Ver Factura Completa"));
    expect(onViewDetail).toHaveBeenCalledWith(mockOrders[0]);
  });
});
