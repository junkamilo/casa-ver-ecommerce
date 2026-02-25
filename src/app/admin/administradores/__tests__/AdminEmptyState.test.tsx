import { render, screen } from "@testing-library/react";
import AdminEmptyState from "../components/AdminEmptyState";

describe("AdminEmptyState", () => {
  it("muestra el mensaje de no resultados", () => {
    render(<AdminEmptyState />);
    expect(screen.getByText("No se encontraron administradores")).toBeInTheDocument();
  });

  it("muestra el texto de sugerencia de búsqueda", () => {
    render(<AdminEmptyState />);
    expect(screen.getByText(/Intenta con otro término/)).toBeInTheDocument();
  });
});
