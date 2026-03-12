import { ALL_STATUSES, ALL_METHODS, getStatusStyles, formatPrice } from "../constants";

describe("ALL_STATUSES", () => {
  it("incluye 'Todos' como primer elemento", () => {
    expect(ALL_STATUSES[0]).toBe("Todos");
  });

  it("contiene los estados de pedido principales", () => {
    expect(ALL_STATUSES).toContain("Pagado");
    expect(ALL_STATUSES).toContain("Pendiente");
    expect(ALL_STATUSES).toContain("Enviado");
    expect(ALL_STATUSES).toContain("Entregado");
    expect(ALL_STATUSES).toContain("Cancelado");
  });

  it("tiene al menos 2 elementos (incluyendo 'Todos')", () => {
    expect(ALL_STATUSES.length).toBeGreaterThanOrEqual(2);
  });
});

describe("ALL_METHODS", () => {
  it("incluye 'Todos' como primer elemento", () => {
    expect(ALL_METHODS[0]).toBe("Todos");
  });

  it("contiene los métodos de pago disponibles", () => {
    expect(ALL_METHODS).toContain("Nequi");
    expect(ALL_METHODS).toContain("Daviplata");
  });

  it("tiene al menos 2 elementos (incluyendo 'Todos')", () => {
    expect(ALL_METHODS.length).toBeGreaterThanOrEqual(2);
  });
});

describe("getStatusStyles", () => {
  it("retorna clases verdes para 'Pagado'", () => {
    expect(getStatusStyles("Pagado")).toContain("emerald");
  });

  it("retorna clases ámbar para 'Pendiente'", () => {
    expect(getStatusStyles("Pendiente")).toContain("amber");
  });

  it("retorna clases para 'Enviado'", () => {
    expect(getStatusStyles("Enviado")).toBeTruthy();
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
