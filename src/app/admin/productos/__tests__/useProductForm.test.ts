import { renderHook, act } from "@testing-library/react";
import { useProductForm } from "../hooks/useProductForm";

describe("useProductForm", () => {
  it("inicializa con valores vacíos", () => {
    const { result } = renderHook(() => useProductForm());
    expect(result.current.name).toBe("");
    expect(result.current.basePrice).toBe("");
    expect(result.current.selectedColors).toHaveLength(0);
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

  it("agrega un color con toggleColor()", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.toggleColor("Negro", "#1C1C1C");
    });

    expect(result.current.selectedColors).toHaveLength(1);
    expect(result.current.selectedColors[0].name).toBe("Negro");
    expect(result.current.selectedColors[0].hexCode).toBe("#1C1C1C");
  });

  it("elimina un color con toggleColor() cuando ya existe", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.toggleColor("Negro", "#1C1C1C");
    });

    expect(result.current.selectedColors).toHaveLength(1);

    act(() => {
      result.current.toggleColor("Negro", "#1C1C1C");
    });

    expect(result.current.selectedColors).toHaveLength(0);
  });

  it("setColorImages asigna imágenes a un color", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.toggleColor("Blanco", "#F5F5F5");
    });

    act(() => {
      result.current.setColorImages("Blanco", ["https://img.com/a.jpg", "https://img.com/b.jpg"]);
    });

    expect(result.current.selectedColors[0].images).toHaveLength(2);
  });

  it("toggleSize agrega una talla", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.toggleSize("M");
    });

    expect(result.current.selectedSizes).toContain("M");
  });

  it("toggleSize elimina una talla si ya existe", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.toggleSize("M");
    });
    act(() => {
      result.current.toggleSize("M");
    });

    expect(result.current.selectedSizes).not.toContain("M");
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

  it("buildPayload() incluye los colores seleccionados", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.toggleColor("Negro", "#1C1C1C");
    });

    const payload = result.current.buildPayload();
    expect(payload.colors).toHaveLength(1);
    expect(payload.colors[0].name).toBe("Negro");
  });

  it("buildPayload() incluye colores vacíos cuando no hay ninguno", () => {
    const { result } = renderHook(() => useProductForm());

    const payload = result.current.buildPayload();
    expect(payload.colors).toHaveLength(0);
  });

  it("isSet inicia en false", () => {
    const { result } = renderHook(() => useProductForm());
    expect(result.current.isSet).toBe(false);
  });

  it("setItems inicia vacío", () => {
    const { result } = renderHook(() => useProductForm());
    expect(result.current.setItems).toHaveLength(0);
  });

  it("addSetItem agrega un item de subcategoría", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.addSetItem();
    });

    expect(result.current.setItems).toHaveLength(1);
  });

  it("removeSetItem elimina un item de subcategoría por localId", () => {
    const { result } = renderHook(() => useProductForm());

    act(() => {
      result.current.addSetItem();
    });

    const localId = result.current.setItems[0].localId;

    act(() => {
      result.current.removeSetItem(localId);
    });

    expect(result.current.setItems).toHaveLength(0);
  });
});
