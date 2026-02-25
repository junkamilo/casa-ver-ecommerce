import { renderHook, act } from "@testing-library/react";
import { useOrders } from "../hooks/useOrders";
import { MOCK_ORDERS } from "../mockData";

describe("useOrders", () => {
  it("retorna todos los pedidos por defecto", () => {
    const { result } = renderHook(() => useOrders());
    expect(result.current.orders).toHaveLength(MOCK_ORDERS.length);
    expect(result.current.filteredOrders).toHaveLength(MOCK_ORDERS.length);
  });

  it("el filtro inicial es ALL", () => {
    const { result } = renderHook(() => useOrders());
    expect(result.current.activeFilter).toBe("ALL");
  });

  it("no está cargando al montar", () => {
    const { result } = renderHook(() => useOrders());
    expect(result.current.isLoading).toBe(false);
  });

  it("expandedId inicia en null", () => {
    const { result } = renderHook(() => useOrders());
    expect(result.current.expandedId).toBeNull();
  });

  it("filtra pedidos por estado DELIVERED", () => {
    const { result } = renderHook(() => useOrders());

    act(() => {
      result.current.setFilter("DELIVERED");
    });

    const deliveredCount = MOCK_ORDERS.filter((o) => o.status === "DELIVERED").length;
    expect(result.current.filteredOrders).toHaveLength(deliveredCount);
    result.current.filteredOrders.forEach((o) => {
      expect(o.status).toBe("DELIVERED");
    });
  });

  it("filtra pedidos por estado CANCELLED", () => {
    const { result } = renderHook(() => useOrders());

    act(() => {
      result.current.setFilter("CANCELLED");
    });

    const cancelledCount = MOCK_ORDERS.filter((o) => o.status === "CANCELLED").length;
    expect(result.current.filteredOrders).toHaveLength(cancelledCount);
  });

  it("vuelve a mostrar todos al seleccionar ALL de nuevo", () => {
    const { result } = renderHook(() => useOrders());

    act(() => result.current.setFilter("PENDING"));
    act(() => result.current.setFilter("ALL"));

    expect(result.current.filteredOrders).toHaveLength(MOCK_ORDERS.length);
  });

  it("toggleExpand abre un pedido", () => {
    const { result } = renderHook(() => useOrders());
    const firstId = MOCK_ORDERS[0].id;

    act(() => {
      result.current.toggleExpand(firstId);
    });

    expect(result.current.expandedId).toBe(firstId);
  });

  it("toggleExpand cierra el pedido si ya estaba abierto", () => {
    const { result } = renderHook(() => useOrders());
    const firstId = MOCK_ORDERS[0].id;

    act(() => result.current.toggleExpand(firstId));
    act(() => result.current.toggleExpand(firstId));

    expect(result.current.expandedId).toBeNull();
  });

  it("toggleExpand cambia al nuevo id si había uno abierto", () => {
    const { result } = renderHook(() => useOrders());
    const [first, second] = MOCK_ORDERS;

    act(() => result.current.toggleExpand(first.id));
    act(() => result.current.toggleExpand(second.id));

    expect(result.current.expandedId).toBe(second.id);
  });

  it("orderCountByStatus incluye el total de ALL", () => {
    const { result } = renderHook(() => useOrders());
    expect(result.current.orderCountByStatus.ALL).toBe(MOCK_ORDERS.length);
  });

  it("orderCountByStatus cuenta correctamente cada estado", () => {
    const { result } = renderHook(() => useOrders());
    const { orderCountByStatus } = result.current;

    MOCK_ORDERS.forEach((o) => {
      expect(orderCountByStatus[o.status]).toBeGreaterThan(0);
    });
  });
});
