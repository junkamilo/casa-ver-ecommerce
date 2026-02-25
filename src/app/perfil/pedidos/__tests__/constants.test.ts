import {
  formatOrderPrice,
  formatOrderDate,
  ORDER_STATUS_CONFIG,
  ORDER_FILTER_LABELS,
  VISIBLE_FILTERS,
} from "../constants";

describe("formatOrderPrice", () => {
  it("formatea un precio en pesos colombianos", () => {
    expect(formatOrderPrice(98000)).toContain("98.000");
  });

  it("incluye el símbolo de moneda COP", () => {
    expect(formatOrderPrice(50000)).toMatch(/\$|COP/);
  });

  it("formatea precio cero correctamente", () => {
    expect(formatOrderPrice(0)).toContain("0");
  });

  it("formatea precios grandes sin decimales", () => {
    const result = formatOrderPrice(1500000);
    expect(result).not.toContain(",00");
  });
});

describe("formatOrderDate", () => {
  it("retorna una fecha legible en español", () => {
    const result = formatOrderDate("2025-02-18T11:05:00Z");
    expect(result).toMatch(/\d{1,2}.*2025/);
  });

  it("incluye el año en la fecha", () => {
    expect(formatOrderDate("2024-11-15T10:30:00Z")).toContain("2024");
  });
});

describe("ORDER_STATUS_CONFIG", () => {
  const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

  it.each(statuses)("tiene configuración para el estado %s", (status) => {
    expect(ORDER_STATUS_CONFIG[status]).toBeDefined();
    expect(ORDER_STATUS_CONFIG[status].label).toBeTruthy();
    expect(ORDER_STATUS_CONFIG[status].color).toBeTruthy();
    expect(ORDER_STATUS_CONFIG[status].dotColor).toBeTruthy();
  });

  it("DELIVERED tiene color verde (emerald)", () => {
    expect(ORDER_STATUS_CONFIG.DELIVERED.color).toContain("emerald");
  });

  it("CANCELLED tiene color rojo (red)", () => {
    expect(ORDER_STATUS_CONFIG.CANCELLED.color).toContain("red");
  });

  it("PENDING tiene color amarillo (yellow)", () => {
    expect(ORDER_STATUS_CONFIG.PENDING.color).toContain("yellow");
  });
});

describe("ORDER_FILTER_LABELS", () => {
  it("tiene etiqueta para ALL", () => {
    expect(ORDER_FILTER_LABELS.ALL).toBe("Todos");
  });

  it("tiene etiqueta para todos los estados", () => {
    expect(ORDER_FILTER_LABELS.PENDING).toBeTruthy();
    expect(ORDER_FILTER_LABELS.DELIVERED).toBeTruthy();
    expect(ORDER_FILTER_LABELS.CANCELLED).toBeTruthy();
  });
});

describe("VISIBLE_FILTERS", () => {
  it("contiene el filtro ALL", () => {
    expect(VISIBLE_FILTERS).toContain("ALL");
  });

  it("no contiene CONFIRMED (no se muestra en la UI)", () => {
    expect(VISIBLE_FILTERS).not.toContain("CONFIRMED");
  });

  it("contiene los filtros principales de UI", () => {
    expect(VISIBLE_FILTERS).toContain("PENDING");
    expect(VISIBLE_FILTERS).toContain("SHIPPED");
    expect(VISIBLE_FILTERS).toContain("DELIVERED");
    expect(VISIBLE_FILTERS).toContain("CANCELLED");
  });
});
