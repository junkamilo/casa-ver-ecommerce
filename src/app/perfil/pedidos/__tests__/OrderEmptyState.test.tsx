import { render, screen } from "@testing-library/react";
import { OrderEmptyState } from "../components/OrderEmptyState";

describe("OrderEmptyState", () => {
  it("muestra mensaje cuando no hay pedidos y no hay filtro activo", () => {
    render(<OrderEmptyState hasActiveFilter={false} />);
    expect(screen.getByText("Aún no tienes pedidos")).toBeInTheDocument();
  });

  it("muestra mensaje secundario cuando no hay filtro activo", () => {
    render(<OrderEmptyState hasActiveFilter={false} />);
    expect(
      screen.getByText("Cuando realices una compra aparecerá aquí")
    ).toBeInTheDocument();
  });

  it("muestra mensaje de sin resultados cuando hay filtro activo", () => {
    render(<OrderEmptyState hasActiveFilter={true} />);
    expect(screen.getByText("Sin pedidos en este estado")).toBeInTheDocument();
  });

  it("muestra mensaje de cambio de filtro cuando hay filtro activo", () => {
    render(<OrderEmptyState hasActiveFilter={true} />);
    expect(
      screen.getByText("Prueba con otro filtro para ver tus pedidos")
    ).toBeInTheDocument();
  });

  it("renderiza el ícono de bolsa de compras", () => {
    const { container } = render(<OrderEmptyState hasActiveFilter={false} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("contiene un contenedor centrado", () => {
    const { container } = render(<OrderEmptyState hasActiveFilter={false} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("text-center");
  });
});
