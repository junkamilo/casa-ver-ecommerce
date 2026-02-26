import { render, screen } from "@testing-library/react";
import { TopProductsTable } from "../components/TopProductsTable";
import { TOP_PRODUCTS } from "../constants";

describe("TopProductsTable", () => {
  it("muestra el título 'Productos Más Vendidos'", () => {
    render(<TopProductsTable />);
    expect(screen.getAllByText("Productos Más Vendidos").length).toBeGreaterThan(0);
  });

  it("muestra el subtítulo de ranking", () => {
    render(<TopProductsTable />);
    expect(
      screen.getAllByText(/Ranking por unidades y volumen de ingresos/).length
    ).toBeGreaterThan(0);
  });

  it("muestra el botón 'Ver reporte completo'", () => {
    render(<TopProductsTable />);
    expect(screen.getAllByText(/Ver reporte completo/).length).toBeGreaterThan(0);
  });

  it("renderiza todos los productos", () => {
    render(<TopProductsTable />);
    TOP_PRODUCTS.forEach((product) => {
      expect(screen.getAllByText(product.name).length).toBeGreaterThan(0);
    });
  });

  it("muestra las unidades vendidas de cada producto", () => {
    render(<TopProductsTable />);
    TOP_PRODUCTS.forEach((product) => {
      const matches = screen.getAllByText(new RegExp(product.sold.toString()));
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it("muestra los ingresos de cada producto", () => {
    render(<TopProductsTable />);
    TOP_PRODUCTS.forEach((product) => {
      expect(screen.getAllByText(product.revenue).length).toBeGreaterThan(0);
    });
  });

  it("muestra la tendencia positiva del primer producto", () => {
    render(<TopProductsTable />);
    const firstProduct = TOP_PRODUCTS[0];
    expect(firstProduct.trend.startsWith("+")).toBe(true);
    expect(screen.getAllByText(firstProduct.trend).length).toBeGreaterThan(0);
  });

  it("muestra la tendencia negativa del producto 'Set Pant Elegante'", () => {
    render(<TopProductsTable />);
    const negativeProduct = TOP_PRODUCTS.find((p) => p.trend.startsWith("-"));
    expect(negativeProduct).toBeDefined();
    expect(
      screen.getAllByText(negativeProduct!.trend).length
    ).toBeGreaterThan(0);
  });

  it("el primer producto tiene badge dorado (rank 1)", () => {
    render(<TopProductsTable />);
    const rankBadges = screen.getAllByText("1");
    expect(rankBadges.length).toBeGreaterThan(0);
    const badge = rankBadges[0];
    expect(badge.className).toContain("bg-[#C19A6B]");
  });

  it("renderiza los encabezados de la tabla desktop", () => {
    render(<TopProductsTable />);
    expect(screen.getAllByText(/Ranking/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Producto/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Unidades/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ingresos/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tendencia/i).length).toBeGreaterThan(0);
  });
});
