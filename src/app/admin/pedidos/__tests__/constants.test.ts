import { ORDERS, ALL_STATUSES, ALL_METHODS, getStatusStyles, formatPrice } from "../constants";

describe("ORDERS", () => {
  it("contiene 5 pedidos", () => {
    expect(ORDERS).toHaveLength(5);
  });

  it("cada pedido tiene las propiedades requeridas", () => {
    ORDERS.forEach((o) => {
      expect(o).toHaveProperty("id");
      expect(o).toHaveProperty("customer");
      expect(o).toHaveProperty("email");
      expect(o).toHaveProperty("phone");
      expect(o).toHaveProperty("items");
      expect(o).toHaveProperty("total");
      expect(o).toHaveProperty("status");
      expect(o).toHaveProperty("paymentMethod");
      expect(o).toHaveProperty("date");
      expect(o).toHaveProperty("address");
    });
  });

  it("cada item tiene name, qty y price", () => {
    ORDERS.forEach((o) => {
      o.items.forEach((item) => {
        expect(item).toHaveProperty("name");
        expect(item).toHaveProperty("qty");
        expect(item).toHaveProperty("price");
      });
    });
  });

  it("los totales son números positivos", () => {
    ORDERS.forEach((o) => {
      expect(o.total).toBeGreaterThan(0);
    });
  });

  it("los IDs tienen el formato ORD-XXXX-XXX", () => {
    ORDERS.forEach((o) => {
      expect(o.id).toMatch(/^ORD-\d{4}-\d{3}$/);
    });
  });
});

describe("ALL_STATUSES", () => {
  it("incluye 'Todos' como primer elemento", () => {
    expect(ALL_STATUSES[0]).toBe("Todos");
  });

  it("contiene los 5 estados de pedido", () => {
    expect(ALL_STATUSES).toContain("Pagado");
    expect(ALL_STATUSES).toContain("Pendiente");
    expect(ALL_STATUSES).toContain("Enviado");
    expect(ALL_STATUSES).toContain("Entregado");
    expect(ALL_STATUSES).toContain("Cancelado");
  });

  it("tiene 6 elementos en total (incluyendo 'Todos')", () => {
    expect(ALL_STATUSES).toHaveLength(6);
  });
});

describe("ALL_METHODS", () => {
  it("incluye 'Todos' como primer elemento", () => {
    expect(ALL_METHODS[0]).toBe("Todos");
  });

  it("contiene los métodos de pago disponibles", () => {
    expect(ALL_METHODS).toContain("Nequi");
    expect(ALL_METHODS).toContain("PSE");
    expect(ALL_METHODS).toContain("Tarjeta Crédito");
    expect(ALL_METHODS).toContain("Efectivo");
    expect(ALL_METHODS).toContain("Daviplata");
  });
});

describe("getStatusStyles", () => {
  it("retorna clases verdes para 'Pagado'", () => {
    expect(getStatusStyles("Pagado")).toContain("emerald");
  });

  it("retorna clases ámbar para 'Pendiente'", () => {
    expect(getStatusStyles("Pendiente")).toContain("amber");
  });

  it("retorna clases azules para 'Enviado'", () => {
    expect(getStatusStyles("Enviado")).toContain("blue");
  });

  it("retorna clases grises para 'Entregado'", () => {
    expect(getStatusStyles("Entregado")).toContain("gray");
  });

  it("retorna clases rojas para 'Cancelado'", () => {
    expect(getStatusStyles("Cancelado")).toContain("red");
  });

  it("retorna clases por defecto para estado desconocido", () => {
    expect(getStatusStyles("Desconocido")).toContain("gray");
  });
});

describe("formatPrice", () => {
  it("retorna un string", () => {
    expect(typeof formatPrice(125000)).toBe("string");
  });

  it("formatea correctamente 0", () => {
    expect(formatPrice(0)).toBeDefined();
  });

  it("el resultado no es vacío", () => {
    expect(formatPrice(50000).length).toBeGreaterThan(0);
  });
});
