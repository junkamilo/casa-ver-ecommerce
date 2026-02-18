import { renderHook, act } from "@testing-library/react";
import { useProductForm } from "../hooks/useProductForm";

describe("useProductForm", () => {
  it("inicializa con valores vacíos", () => {
    const { result } = renderHook(() => useProductForm());
    expect(result.current.name).toBe("");
    expect(result.current.basePrice).toBe("");
    expect(result.current.colors).toHaveLength(0);
  });

  it("resetea todos los campos al llamar reset()", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.setName("Producto Test");
      result.current.setBasePrice("50000");
    });

    expect(result.current.name).toBe("Producto Test");

    act(() => {
      result.current.reset();
    });

    expect(result.current.name).toBe("");
    expect(result.current.basePrice).toBe("");
  });

  it("agrega un color con addColor()", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.addColor();
    });

    expect(result.current.colors).toHaveLength(1);
  });

  it("elimina un color con removeColor()", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.addColor();
    });

    const tempId = result.current.colors[0].tempId;

    act(() => {
      result.current.removeColor(tempId);
    });

    expect(result.current.colors).toHaveLength(0);
  });

  it("actualiza el nombre de un color con updateColor()", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.addColor();
    });

    const tempId = result.current.colors[0].tempId;

    act(() => {
      result.current.updateColor(tempId, "name", "Verde Esmeralda");
    });

    expect(result.current.colors[0].name).toBe("Verde Esmeralda");
  });

  it("actualiza variante de stock con updateVariant()", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.addColor();
    });

    const tempId = result.current.colors[0].tempId;

    act(() => {
      result.current.updateVariant(tempId, "S", "stock", "10");
    });

    expect(result.current.colors[0].variants["S"].stock).toBe("10");
  });

  it("buildPayload() construye el payload correcto", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.setName("Enterizo Test");
      result.current.setBasePrice("89900");
      result.current.setCategoryId("cat-123");
    });

    const payload = result.current.buildPayload();
    expect(payload.name).toBe("Enterizo Test");
    expect(payload.basePrice).toBe(89900);
    expect(payload.categoryId).toBe("cat-123");
  });

  it("buildPayload() filtra colores sin nombre", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.addColor();
    });

    const payload = result.current.buildPayload();
    expect(payload.colors).toHaveLength(0);
  });
});
