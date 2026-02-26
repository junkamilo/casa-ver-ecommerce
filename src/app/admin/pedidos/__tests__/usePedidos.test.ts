import { renderHook, act } from "@testing-library/react";
import { usePedidos } from "../hooks/usePedidos";
import { ORDERS } from "../constants";

describe("usePedidos", () => {
  it("search inicia vacío", () => {
    const { result } = renderHook(() => usePedidos());
    expect(result.current.search).toBe("");
  });

  it("statusFilter inicia en 'Todos'", () => {
    const { result } = renderHook(() => usePedidos());
    expect(result.current.statusFilter).toBe("Todos");
  });

  it("methodFilter inicia en 'Todos'", () => {
    const { result } = renderHook(() => usePedidos());
    expect(result.current.methodFilter).toBe("Todos");
  });

  it("detailOrder inicia en null", () => {
    const { result } = renderHook(() => usePedidos());
    expect(result.current.detailOrder).toBeNull();
  });

  it("expandedOrder inicia en null", () => {
    const { result } = renderHook(() => usePedidos());
    expect(result.current.expandedOrder).toBeNull();
  });

  it("filteredOrders devuelve todos los pedidos sin filtros activos", () => {
    const { result } = renderHook(() => usePedidos());
    expect(result.current.filteredOrders).toHaveLength(ORDERS.length);
  });

  it("filtra por nombre de cliente (case-insensitive)", () => {
    const { result } = renderHook(() => usePedidos());
    act(() => { result.current.setSearch("maría"); });
    expect(result.current.filteredOrders).toHaveLength(1);
    expect(result.current.filteredOrders[0].customer).toBe("María García");
  });

  it("filtra por ID de pedido", () => {
    const { result } = renderHook(() => usePedidos());
    act(() => { result.current.setSearch("ORD-2024-003"); });
    expect(result.current.filteredOrders).toHaveLength(1);
    expect(result.current.filteredOrders[0].id).toBe("ORD-2024-003");
  });

  it("filtra por estado 'Cancelado'", () => {
    const { result } = renderHook(() => usePedidos());
    act(() => { result.current.setStatusFilter("Cancelado"); });
    expect(result.current.filteredOrders).toHaveLength(1);
    expect(result.current.filteredOrders[0].status).toBe("Cancelado");
  });

  it("filtra por estado 'Pagado'", () => {
    const { result } = renderHook(() => usePedidos());
    act(() => { result.current.setStatusFilter("Pagado"); });
    expect(result.current.filteredOrders.every((o) => o.status === "Pagado")).toBe(true);
  });

  it("filtra por método de pago 'Nequi'", () => {
    const { result } = renderHook(() => usePedidos());
    act(() => { result.current.setMethodFilter("Nequi"); });
    expect(result.current.filteredOrders).toHaveLength(1);
    expect(result.current.filteredOrders[0].paymentMethod).toBe("Nequi");
  });

  it("retorna vacío cuando no hay coincidencias de búsqueda", () => {
    const { result } = renderHook(() => usePedidos());
    act(() => { result.current.setSearch("XYZ-NO-EXISTE-9999"); });
    expect(result.current.filteredOrders).toHaveLength(0);
  });

  it("combina filtros de estado y búsqueda", () => {
    const { result } = renderHook(() => usePedidos());
    act(() => {
      result.current.setStatusFilter("Pagado");
      result.current.setSearch("María");
    });
    expect(result.current.filteredOrders).toHaveLength(1);
  });

  it("setDetailOrder actualiza detailOrder", () => {
    const { result } = renderHook(() => usePedidos());
    act(() => { result.current.setDetailOrder(ORDERS[0]); });
    expect(result.current.detailOrder).toEqual(ORDERS[0]);
  });

  it("setDetailOrder acepta null para cerrar el modal", () => {
    const { result } = renderHook(() => usePedidos());
    act(() => { result.current.setDetailOrder(ORDERS[0]); });
    act(() => { result.current.setDetailOrder(null); });
    expect(result.current.detailOrder).toBeNull();
  });

  it("setExpandedOrder actualiza expandedOrder", () => {
    const { result } = renderHook(() => usePedidos());
    act(() => { result.current.setExpandedOrder("ORD-2024-001"); });
    expect(result.current.expandedOrder).toBe("ORD-2024-001");
  });

  it("setExpandedOrder acepta null para colapsar", () => {
    const { result } = renderHook(() => usePedidos());
    act(() => { result.current.setExpandedOrder("ORD-2024-001"); });
    act(() => { result.current.setExpandedOrder(null); });
    expect(result.current.expandedOrder).toBeNull();
  });
});
