import { renderHook, act, waitFor } from "@testing-library/react";
import { usePedidos } from "../hooks/usePedidos";
import type { Order } from "../types";

const MOCK_ORDERS: Order[] = [
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
  {
    id: "ORD-2024-003",
    customer: "Ana Martínez",
    email: "ana@example.com",
    phone: "3205551234",
    items: [{ name: "Pantalón Lino", qty: 1, price: 65000 }],
    total: 65000,
    status: "Cancelado",
    paymentMethod: "Daviplata",
    date: "2024-12-17",
    address: "Avenida 30 # 5-10, Cali",
  },
  {
    id: "ORD-2024-004",
    customer: "Luis Pérez",
    email: "luis@example.com",
    phone: "3151112222",
    items: [{ name: "Vestido Verano", qty: 1, price: 120000 }],
    total: 120000,
    status: "Pagado",
    paymentMethod: "Addi",
    date: "2024-12-18",
    address: "Calle 80 # 12-34, Bogotá",
  },
  {
    id: "ORD-2024-005",
    customer: "Sofía Ruiz",
    email: "sofia@example.com",
    phone: "3003334444",
    items: [{ name: "Conjunto Casual", qty: 1, price: 95000 }],
    total: 95000,
    status: "Enviado",
    paymentMethod: "Bancolombia",
    date: "2024-12-19",
    address: "Transversal 15 # 22-10, Barranquilla",
  },
];

jest.mock("@/app/actions/orders", () => ({
  getOrders: jest.fn(),
  updateOrderStatus: jest.fn().mockResolvedValue(undefined),
}));

import { getOrders } from "@/app/actions/orders";
const mockGetOrders = getOrders as jest.MockedFunction<typeof getOrders>;

beforeEach(() => {
  mockGetOrders.mockResolvedValue(MOCK_ORDERS);
});

afterEach(() => {
  jest.clearAllMocks();
});

async function mountAndWait() {
  const hook = renderHook(() => usePedidos());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe("usePedidos", () => {
  it("search inicia vacío", async () => {
    const { result } = await mountAndWait();
    expect(result.current.search).toBe("");
  });

  it("statusFilter inicia en 'Todos'", async () => {
    const { result } = await mountAndWait();
    expect(result.current.statusFilter).toBe("Todos");
  });

  it("methodFilter inicia en 'Todos'", async () => {
    const { result } = await mountAndWait();
    expect(result.current.methodFilter).toBe("Todos");
  });

  it("detailOrder inicia en null", async () => {
    const { result } = await mountAndWait();
    expect(result.current.detailOrder).toBeNull();
  });

  it("expandedOrder inicia en null", async () => {
    const { result } = await mountAndWait();
    expect(result.current.expandedOrder).toBeNull();
  });

  it("filteredOrders devuelve todos los pedidos sin filtros activos", async () => {
    const { result } = await mountAndWait();
    expect(result.current.filteredOrders).toHaveLength(MOCK_ORDERS.length);
  });

  it("filtra por nombre de cliente (case-insensitive)", async () => {
    const { result } = await mountAndWait();
    act(() => { result.current.setSearch("maría"); });
    expect(result.current.filteredOrders).toHaveLength(1);
    expect(result.current.filteredOrders[0].customer).toBe("María García");
  });

  it("filtra por ID de pedido", async () => {
    const { result } = await mountAndWait();
    act(() => { result.current.setSearch("ORD-2024-003"); });
    expect(result.current.filteredOrders).toHaveLength(1);
    expect(result.current.filteredOrders[0].id).toBe("ORD-2024-003");
  });

  it("filtra por estado 'Cancelado'", async () => {
    const { result } = await mountAndWait();
    act(() => { result.current.setStatusFilter("Cancelado"); });
    expect(result.current.filteredOrders).toHaveLength(1);
    expect(result.current.filteredOrders[0].status).toBe("Cancelado");
  });

  it("filtra por estado 'Pagado'", async () => {
    const { result } = await mountAndWait();
    act(() => { result.current.setStatusFilter("Pagado"); });
    expect(result.current.filteredOrders.every((o) => o.status === "Pagado")).toBe(true);
  });

  it("filtra por método de pago 'Nequi'", async () => {
    const { result } = await mountAndWait();
    act(() => { result.current.setMethodFilter("Nequi"); });
    expect(result.current.filteredOrders).toHaveLength(1);
    expect(result.current.filteredOrders[0].paymentMethod).toBe("Nequi");
  });

  it("retorna vacío cuando no hay coincidencias de búsqueda", async () => {
    const { result } = await mountAndWait();
    act(() => { result.current.setSearch("XYZ-NO-EXISTE-9999"); });
    expect(result.current.filteredOrders).toHaveLength(0);
  });

  it("combina filtros de estado y búsqueda", async () => {
    const { result } = await mountAndWait();
    act(() => {
      result.current.setStatusFilter("Pagado");
      result.current.setSearch("María");
    });
    expect(result.current.filteredOrders).toHaveLength(1);
  });

  it("setDetailOrder actualiza detailOrder", async () => {
    const { result } = await mountAndWait();
    act(() => { result.current.setDetailOrder(MOCK_ORDERS[0]); });
    expect(result.current.detailOrder).toEqual(MOCK_ORDERS[0]);
  });

  it("setDetailOrder acepta null para cerrar el modal", async () => {
    const { result } = await mountAndWait();
    act(() => { result.current.setDetailOrder(MOCK_ORDERS[0]); });
    act(() => { result.current.setDetailOrder(null); });
    expect(result.current.detailOrder).toBeNull();
  });

  it("setExpandedOrder actualiza expandedOrder", async () => {
    const { result } = await mountAndWait();
    act(() => { result.current.setExpandedOrder("ORD-2024-001"); });
    expect(result.current.expandedOrder).toBe("ORD-2024-001");
  });

  it("setExpandedOrder acepta null para colapsar", async () => {
    const { result } = await mountAndWait();
    act(() => { result.current.setExpandedOrder("ORD-2024-001"); });
    act(() => { result.current.setExpandedOrder(null); });
    expect(result.current.expandedOrder).toBeNull();
  });
});
