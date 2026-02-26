import { renderHook, act, waitFor } from "@testing-library/react";
import { useCollection } from "../hooks/useCollection";

global.fetch = jest.fn();

describe("useCollection", () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
  });

  it("isAvailabilityOpen inicia en true", () => {
    const { result } = renderHook(() => useCollection("enterizos"));
    expect(result.current.isAvailabilityOpen).toBe(true);
  });

  it("isPriceOpen inicia en true", () => {
    const { result } = renderHook(() => useCollection("enterizos"));
    expect(result.current.isPriceOpen).toBe(true);
  });

  it("mobileFiltersOpen inicia en false", () => {
    const { result } = renderHook(() => useCollection("enterizos"));
    expect(result.current.mobileFiltersOpen).toBe(false);
  });

  it("category inicia en null", () => {
    const { result } = renderHook(() => useCollection("enterizos"));
    expect(result.current.category).toBeNull();
  });

  it("title se construye desde el slug cuando no hay categoría", async () => {
    const { result } = renderHook(() => useCollection("nueva-coleccion"));
    await waitFor(() => {
      expect(result.current.title).toBe("NUEVA COLECCION");
    });
  });

  it("title usa el nombre de categoría en mayúsculas cuando la API responde", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ name: "Enterizos", description: "Descripción" }),
    });
    const { result } = renderHook(() => useCollection("enterizos"));
    await waitFor(() => {
      expect(result.current.title).toBe("ENTERIZOS");
    });
  });

  it("setIsAvailabilityOpen actualiza el estado", () => {
    const { result } = renderHook(() => useCollection("enterizos"));
    act(() => { result.current.setIsAvailabilityOpen(false); });
    expect(result.current.isAvailabilityOpen).toBe(false);
  });

  it("setIsPriceOpen actualiza el estado", () => {
    const { result } = renderHook(() => useCollection("enterizos"));
    act(() => { result.current.setIsPriceOpen(false); });
    expect(result.current.isPriceOpen).toBe(false);
  });

  it("setMobileFiltersOpen actualiza el estado a true", () => {
    const { result } = renderHook(() => useCollection("enterizos"));
    act(() => { result.current.setMobileFiltersOpen(true); });
    expect(result.current.mobileFiltersOpen).toBe(true);
  });

  it("setMobileFiltersOpen acepta false para cerrar", () => {
    const { result } = renderHook(() => useCollection("enterizos"));
    act(() => { result.current.setMobileFiltersOpen(true); });
    act(() => { result.current.setMobileFiltersOpen(false); });
    expect(result.current.mobileFiltersOpen).toBe(false);
  });

  it("llama a fetch con la URL correcta basada en el slug", async () => {
    renderHook(() => useCollection("bodys"));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/categories/bodys");
    });
  });
});
