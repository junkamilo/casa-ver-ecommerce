import { renderHook, act, waitFor } from "@testing-library/react";
import { useCategoryManager } from "../hooks/useCategoryManager";

const mockFetch = jest.fn();
global.fetch = mockFetch;
global.confirm = jest.fn(() => true);

const emptyFetch = () =>
  mockFetch.mockResolvedValue({ ok: true, json: async () => [] });

async function mountAndWait() {
  emptyFetch();
  const hook = renderHook(() => useCategoryManager());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

describe("useCategoryManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("inicializa con estado vacío y cargando", () => {
    emptyFetch();
    const { result } = renderHook(() => useCategoryManager());
    expect(result.current.categories).toHaveLength(0);
    expect(result.current.loading).toBe(true);
    expect(result.current.toast).toBeNull();
  });

  it("carga categorías al montar", async () => {
    const mockData = [
      { id: "1", name: "Ropa", slug: "ropa", _count: { products: 3 } },
    ];
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockData });
    const { result } = renderHook(() => useCategoryManager());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.categories).toHaveLength(1);
  });

  it("filtra categorías por search", async () => {
    const mockData = [
      { id: "1", name: "Ropa Deportiva", slug: "ropa", _count: { products: 2 } },
      { id: "2", name: "Accesorios", slug: "accesorios", _count: { products: 5 } },
    ];
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockData });
    const { result } = renderHook(() => useCategoryManager());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => { result.current.setSearch("ropa"); });

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0].name).toBe("Ropa Deportiva");
  });

  it("filtered muestra todas las categorías cuando search está vacío", async () => {
    const mockData = [
      { id: "1", name: "A", slug: "a", _count: { products: 0 } },
      { id: "2", name: "B", slug: "b", _count: { products: 0 } },
    ];
    mockFetch.mockResolvedValue({ ok: true, json: async () => mockData });
    const { result } = renderHook(() => useCategoryManager());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.filtered).toHaveLength(2);
  });

  it("handleDelete no llama a fetch si el usuario cancela confirm", async () => {
    (global.confirm as jest.Mock).mockReturnValueOnce(false);
    const { result } = await mountAndWait();

    const fetchCallsBefore = mockFetch.mock.calls.length;
    await act(async () => { await result.current.handleDelete("1"); });

    expect(mockFetch.mock.calls.length).toBe(fetchCallsBefore);
  });

  it("setToast establece el toast", async () => {
    const { result } = await mountAndWait();

    act(() => { result.current.setToast({ type: "error", message: "Fallo" }); });
    expect(result.current.toast).toEqual({ type: "error", message: "Fallo" });

    act(() => { result.current.setToast(null); });
    expect(result.current.toast).toBeNull();
  });
});
