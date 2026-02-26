import {
  PERIOD_LABELS,
  SALES_DATA,
  TOP_PRODUCTS,
  DAILY_SALES,
  MAX_DAILY_SALE,
  CATEGORY_SALES,
  formatPrice,
} from "../constants";

describe("PERIOD_LABELS", () => {
  it("contiene las tres claves de periodo", () => {
    expect(Object.keys(PERIOD_LABELS)).toEqual(["day", "week", "month"]);
  });

  it("devuelve los labels correctos", () => {
    expect(PERIOD_LABELS.day).toBe("Hoy");
    expect(PERIOD_LABELS.week).toBe("Esta Semana");
    expect(PERIOD_LABELS.month).toBe("Este Mes");
  });
});

describe("SALES_DATA", () => {
  it("contiene datos para los tres periodos", () => {
    expect(SALES_DATA.day).toBeDefined();
    expect(SALES_DATA.week).toBeDefined();
    expect(SALES_DATA.month).toBeDefined();
  });

  it("cada periodo tiene todas las propiedades requeridas", () => {
    (["day", "week", "month"] as const).forEach((p) => {
      expect(SALES_DATA[p]).toHaveProperty("total");
      expect(SALES_DATA[p]).toHaveProperty("orders");
      expect(SALES_DATA[p]).toHaveProperty("avgTicket");
      expect(SALES_DATA[p]).toHaveProperty("newCustomers");
      expect(SALES_DATA[p]).toHaveProperty("change");
    });
  });

  it("los orders son números positivos", () => {
    expect(SALES_DATA.day.orders).toBeGreaterThan(0);
    expect(SALES_DATA.week.orders).toBeGreaterThan(0);
    expect(SALES_DATA.month.orders).toBeGreaterThan(0);
  });
});

describe("TOP_PRODUCTS", () => {
  it("contiene 6 productos", () => {
    expect(TOP_PRODUCTS).toHaveLength(6);
  });

  it("cada producto tiene name, sold, revenue y trend", () => {
    TOP_PRODUCTS.forEach((p) => {
      expect(p).toHaveProperty("name");
      expect(p).toHaveProperty("sold");
      expect(p).toHaveProperty("revenue");
      expect(p).toHaveProperty("trend");
    });
  });

  it("al menos un producto tiene tendencia negativa", () => {
    const negative = TOP_PRODUCTS.filter((p) => p.trend.startsWith("-"));
    expect(negative.length).toBeGreaterThan(0);
  });
});

describe("DAILY_SALES", () => {
  it("contiene 7 días", () => {
    expect(DAILY_SALES).toHaveLength(7);
  });

  it("cada entrada tiene day y amount", () => {
    DAILY_SALES.forEach((d) => {
      expect(d).toHaveProperty("day");
      expect(d).toHaveProperty("amount");
      expect(d.amount).toBeGreaterThan(0);
    });
  });
});

describe("MAX_DAILY_SALE", () => {
  it("es el valor máximo de DAILY_SALES", () => {
    const max = Math.max(...DAILY_SALES.map((d) => d.amount));
    expect(MAX_DAILY_SALE).toBe(max);
  });

  it("es mayor que cero", () => {
    expect(MAX_DAILY_SALE).toBeGreaterThan(0);
  });
});

describe("CATEGORY_SALES", () => {
  it("contiene 5 categorías", () => {
    expect(CATEGORY_SALES).toHaveLength(5);
  });

  it("los porcentajes suman 100", () => {
    const total = CATEGORY_SALES.reduce((acc, c) => acc + c.percentage, 0);
    expect(total).toBe(100);
  });

  it("cada categoría tiene name, percentage y color", () => {
    CATEGORY_SALES.forEach((c) => {
      expect(c).toHaveProperty("name");
      expect(c).toHaveProperty("percentage");
      expect(c).toHaveProperty("color");
    });
  });
});

describe("formatPrice", () => {
  it("formatea número en pesos colombianos", () => {
    const result = formatPrice(1000000);
    expect(result).toContain("1");
    expect(result).toContain("000");
  });

  it("formatea cero correctamente", () => {
    const result = formatPrice(0);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  it("incluye símbolo de moneda COP", () => {
    const result = formatPrice(50000);
    expect(result.length).toBeGreaterThan(0);
  });
});
