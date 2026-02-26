import { renderHook, act } from "@testing-library/react";
import { useEstadisticas } from "../hooks/useEstadisticas";
import { SALES_DATA } from "../constants";

describe("useEstadisticas", () => {
  it("el periodo inicial es 'week'", () => {
    const { result } = renderHook(() => useEstadisticas());
    expect(result.current.period).toBe("week");
  });

  it("data inicial corresponde al periodo 'week'", () => {
    const { result } = renderHook(() => useEstadisticas());
    expect(result.current.data).toEqual(SALES_DATA.week);
  });

  it("setPeriod actualiza el periodo a 'day'", () => {
    const { result } = renderHook(() => useEstadisticas());
    act(() => {
      result.current.setPeriod("day");
    });
    expect(result.current.period).toBe("day");
  });

  it("data cambia al cambiar el periodo a 'day'", () => {
    const { result } = renderHook(() => useEstadisticas());
    act(() => {
      result.current.setPeriod("day");
    });
    expect(result.current.data).toEqual(SALES_DATA.day);
  });

  it("setPeriod actualiza el periodo a 'month'", () => {
    const { result } = renderHook(() => useEstadisticas());
    act(() => {
      result.current.setPeriod("month");
    });
    expect(result.current.period).toBe("month");
    expect(result.current.data).toEqual(SALES_DATA.month);
  });

  it("expone setPeriod como función", () => {
    const { result } = renderHook(() => useEstadisticas());
    expect(typeof result.current.setPeriod).toBe("function");
  });
});
