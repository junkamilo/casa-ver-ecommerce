import { render, screen, fireEvent } from "@testing-library/react";
import { PedidosTable } from "../components/PedidosTable";
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
    date: "2024-12-15 14:32",
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
    date: "2024-12-16 10:00",
    address: "Carrera 50 # 10-20, Medellín",
  },
  {
    id: "ORD-2024-003",
    customer: "Ana Martínez",
    email: "ana@example.com",
    phone: "3205551234",
    items: [{ name: "Pantalón Lino", qty: 1, price: 65000 }],
    total: 65000,
    status: "Cancelado",
    paymentMethod: "Daviplata",
    date: "2024-12-17 09:15",
    address: "Avenida 30 # 5-10, Cali",
  },
];

describe("PedidosTable", () => {
  it("renderiza todos los encabezados de la tabla", () => {
    render(<PedidosTable orders={mockOrders} onViewDetail={jest.fn()} />);
    expect(screen.getByText("Pedido")).toBeInTheDocument();
    expect(screen.getByText("Cliente")).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText("Método")).toBeInTheDocument();
    expect(screen.getByText("Fecha")).toBeInTheDocument();
    expect(screen.getByText("Acciones")).toBeInTheDocument();
  });

  it("renderiza el ID de cada pedido", () => {
    render(<PedidosTable orders={mockOrders} onViewDetail={jest.fn()} />);
    mockOrders.forEach((o) => {
      expect(screen.getByText(o.id)).toBeInTheDocument();
    });
  });

  it("renderiza el nombre del cliente", () => {
    render(<PedidosTable orders={mockOrders} onViewDetail={jest.fn()} />);
    mockOrders.forEach((o) => {
      expect(screen.getByText(o.customer)).toBeInTheDocument();
    });
  });

  it("renderiza el email del cliente", () => {
    render(<PedidosTable orders={mockOrders} onViewDetail={jest.fn()} />);
    expect(screen.getByText(mockOrders[0].email)).toBeInTheDocument();
  });

  it("renderiza el estado de cada pedido", () => {
    render(<PedidosTable orders={mockOrders} onViewDetail={jest.fn()} />);
    mockOrders.forEach((o) => {
      expect(screen.getByText(o.status)).toBeInTheDocument();
    });
  });

  it("renderiza el método de pago", () => {
    render(<PedidosTable orders={mockOrders} onViewDetail={jest.fn()} />);
    expect(screen.getByText(mockOrders[0].paymentMethod)).toBeInTheDocument();
  });

  it("muestra solo la fecha sin la hora", () => {
    render(<PedidosTable orders={mockOrders} onViewDetail={jest.fn()} />);
    expect(screen.getByText("2024-12-15")).toBeInTheDocument();
    expect(screen.queryByText("14:32")).not.toBeInTheDocument();
  });

  it("llama a onViewDetail con el pedido correcto al hacer click", () => {
    const onViewDetail = jest.fn();
    render(<PedidosTable orders={mockOrders} onViewDetail={onViewDetail} />);
    fireEvent.click(screen.getAllByTitle("Ver Detalle")[0]);
    expect(onViewDetail).toHaveBeenCalledWith(mockOrders[0]);
  });

  it("muestra un botón de detalle por cada pedido", () => {
    render(<PedidosTable orders={mockOrders} onViewDetail={jest.fn()} />);
    expect(screen.getAllByTitle("Ver Detalle")).toHaveLength(mockOrders.length);
  });

  it("muestra mensaje de vacío cuando no hay pedidos", () => {
    render(<PedidosTable orders={[]} onViewDetail={jest.fn()} />);
    expect(screen.getByText("No se encontraron pedidos")).toBeInTheDocument();
  });

  it("no muestra el mensaje vacío cuando hay pedidos", () => {
    render(<PedidosTable orders={mockOrders} onViewDetail={jest.fn()} />);
    expect(screen.queryByText("No se encontraron pedidos")).not.toBeInTheDocument();
  });
});
