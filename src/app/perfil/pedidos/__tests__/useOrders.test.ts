import { renderHook, act, waitFor } from "@testing-library/react";
import { useOrders } from "../hooks/useOrders";
import { MOCK_ORDERS } from "../mockData";

// Mock global.fetch para aislar el hook de la red real.
beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(MOCK_ORDERS),
  });
});

afterEach(() => {
  jest.resetAllMocks();
});

describe("useOrders", () => {
  it("inicia en estado de carga", () => {
    const { result } = renderHook(() => useOrders());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.orders).toHaveLength(0);
  });

  it("carga los pedidos desde la API al montar", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.orders).toHaveLength(MOCK_ORDERS.length);
    expect(result.current.error).toBeNull();
  });

  it("retorna todos los pedidos filtrados por ALL por defecto", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.activeFilter).toBe("ALL");
    expect(result.current.filteredOrders).toHaveLength(MOCK_ORDERS.length);
  });

  it("expone error cuando la API falla", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500 });
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.orders).toHaveLength(0);
    expect(result.current.error).not.toBeNull();
  });

  it("expone error cuando fetch lanza una excepción de red", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).not.toBeNull();
  });

  it("selectedOrder inicia en null", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.selectedOrder).toBeNull();
  });

  it("openOrder establece el pedido seleccionado", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.openOrder(MOCK_ORDERS[0]));
    expect(result.current.selectedOrder?.id).toBe(MOCK_ORDERS[0].id);
  });

  it("closeOrder limpia el pedido seleccionado", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.openOrder(MOCK_ORDERS[0]));
    act(() => result.current.closeOrder());
    expect(result.current.selectedOrder).toBeNull();
  });

  it("filtra pedidos por estado DELIVERED", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setFilter("DELIVERED"));

    const deliveredCount = MOCK_ORDERS.filter((o) => o.status === "DELIVERED").length;
    expect(result.current.filteredOrders).toHaveLength(deliveredCount);
    result.current.filteredOrders.forEach((o) => {
      expect(o.status).toBe("DELIVERED");
    });
  });

  it("filtra pedidos por estado CANCELLED", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setFilter("CANCELLED"));

    const cancelledCount = MOCK_ORDERS.filter((o) => o.status === "CANCELLED").length;
    expect(result.current.filteredOrders).toHaveLength(cancelledCount);
  });

  it("vuelve a mostrar todos al seleccionar ALL", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setFilter("PENDING"));
    act(() => result.current.setFilter("ALL"));

    expect(result.current.filteredOrders).toHaveLength(MOCK_ORDERS.length);
  });

  it("setFilter resetea currentPage a 1", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setPage(2));
    act(() => result.current.setFilter("PENDING"));
    expect(result.current.currentPage).toBe(1);
  });

  it("paginatedOrders contiene un subconjunto de filteredOrders", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.paginatedOrders.forEach((o) => {
      expect(result.current.filteredOrders).toContainEqual(o);
    });
  });

  it("orderCountByStatus incluye el total de ALL", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.orderCountByStatus.ALL).toBe(MOCK_ORDERS.length);
  });

  it("orderCountByStatus cuenta correctamente cada estado", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    MOCK_ORDERS.forEach((o) => {
      expect(result.current.orderCountByStatus[o.status]).toBeGreaterThan(0);
    });
  });

  it("markDelivered actualiza el estado del pedido en el store", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const shippedOrder = MOCK_ORDERS.find((o) => o.status === "SHIPPED");
    if (!shippedOrder) return; // skips si no hay pedido SHIPPED en mockData

    act(() => result.current.markDelivered(shippedOrder.id));
    const updated = result.current.orders.find((o) => o.id === shippedOrder.id);
    expect(updated?.status).toBe("DELIVERED");
  });

  it("markDelivered actualiza selectedOrder si coincide con el id", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const shippedOrder = MOCK_ORDERS.find((o) => o.status === "SHIPPED");
    if (!shippedOrder) return;

    act(() => result.current.openOrder(shippedOrder));
    act(() => result.current.markDelivered(shippedOrder.id));
    expect(result.current.selectedOrder?.status).toBe("DELIVERED");
  });
});
