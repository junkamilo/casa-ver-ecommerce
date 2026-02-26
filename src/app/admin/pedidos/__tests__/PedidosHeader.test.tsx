import { render, screen } from "@testing-library/react";
import { PedidosHeader } from "../components/PedidosHeader";

describe("PedidosHeader", () => {
  it("muestra el título 'Pedidos'", () => {
    render(<PedidosHeader />);
    expect(screen.getByText("Pedidos")).toBeInTheDocument();
  });

  it("muestra el subtítulo de gestión", () => {
    render(<PedidosHeader />);
    expect(screen.getByText(/Gestión y seguimiento de ventas/)).toBeInTheDocument();
  });

  it("muestra el botón 'Exportar Reporte'", () => {
    render(<PedidosHeader />);
    expect(screen.getByRole("button", { name: /Exportar Reporte/i })).toBeInTheDocument();
  });

  it("el botón de exportar es de tipo button", () => {
    render(<PedidosHeader />);
    const btn = screen.getByRole("button", { name: /Exportar Reporte/i });
    expect(btn.tagName).toBe("BUTTON");
  });
});
