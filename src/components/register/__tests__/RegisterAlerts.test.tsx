import { render, screen } from "@testing-library/react";
import RegisterAlerts from "../components/RegisterAlerts";

describe("RegisterAlerts", () => {
  it("no renderiza nada cuando error y success son null", () => {
    const { container } = render(<RegisterAlerts error={null} success={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra el mensaje de error", () => {
    render(<RegisterAlerts error="El correo ya existe" success={null} />);
    expect(screen.getByText("El correo ya existe")).toBeInTheDocument();
  });

  it("aplica clases rojas para el error", () => {
    render(<RegisterAlerts error="Error" success={null} />);
    const alert = screen.getByText("Error").closest("div");
    expect(alert).toHaveClass("bg-red-50");
    expect(alert).toHaveClass("border-red-500");
  });

  it("muestra el mensaje de éxito", () => {
    render(<RegisterAlerts error={null} success="¡Cuenta creada con éxito!" />);
    expect(screen.getByText("¡Cuenta creada con éxito!")).toBeInTheDocument();
  });

  it("aplica clases verdes para el éxito", () => {
    render(<RegisterAlerts error={null} success="¡Éxito!" />);
    const alert = screen.getByText("¡Éxito!").closest("div");
    expect(alert).toHaveClass("bg-green-50");
    expect(alert).toHaveClass("border-green-500");
  });

  it("puede mostrar error y success simultáneamente", () => {
    render(<RegisterAlerts error="Hay un error" success="Pero también éxito" />);
    expect(screen.getByText("Hay un error")).toBeInTheDocument();
    expect(screen.getByText("Pero también éxito")).toBeInTheDocument();
  });
});
