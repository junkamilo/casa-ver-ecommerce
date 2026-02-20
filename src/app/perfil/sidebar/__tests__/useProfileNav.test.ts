import { renderHook, act } from "@testing-library/react";
import { useProfileNav } from "../hooks/useProfileNav";

describe("useProfileNav", () => {
  it("inicia con la sección 'perfil' por defecto", () => {
    const { result } = renderHook(() => useProfileNav());
    expect(result.current.activeSection).toBe("perfil");
  });

  it("acepta una sección inicial personalizada", () => {
    const { result } = renderHook(() => useProfileNav("pedidos"));
    expect(result.current.activeSection).toBe("pedidos");
  });

  it("cambia la sección activa con setActiveSection", () => {
    const { result } = renderHook(() => useProfileNav());

    act(() => {
      result.current.setActiveSection("pedidos");
    });

    expect(result.current.activeSection).toBe("pedidos");
  });

  it("puede volver a la sección anterior", () => {
    const { result } = renderHook(() => useProfileNav());

    act(() => result.current.setActiveSection("pedidos"));
    act(() => result.current.setActiveSection("perfil"));

    expect(result.current.activeSection).toBe("perfil");
  });

  it("isActive retorna true para la sección activa", () => {
    const { result } = renderHook(() => useProfileNav("perfil"));
    expect(result.current.isActive("perfil")).toBe(true);
  });

  it("isActive retorna false para la sección inactiva", () => {
    const { result } = renderHook(() => useProfileNav("perfil"));
    expect(result.current.isActive("pedidos")).toBe(false);
  });

  it("isActive se actualiza correctamente tras cambiar sección", () => {
    const { result } = renderHook(() => useProfileNav());

    act(() => {
      result.current.setActiveSection("pedidos");
    });

    expect(result.current.isActive("pedidos")).toBe(true);
    expect(result.current.isActive("perfil")).toBe(false);
  });
});
