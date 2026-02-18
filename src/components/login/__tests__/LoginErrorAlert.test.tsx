import { render, screen } from "@testing-library/react";
import LoginErrorAlert from "../components/LoginErrorAlert";

describe("LoginErrorAlert", () => {
  it("no renderiza nada cuando error es null", () => {
    const { container } = render(<LoginErrorAlert error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra el mensaje de error cuando error no es null", () => {
    render(<LoginErrorAlert error="Correo o contraseña incorrectos" />);
    expect(screen.getByText("Correo o contraseña incorrectos")).toBeInTheDocument();
  });

  it("aplica clases de color rojo para el alert", () => {
    const { container } = render(<LoginErrorAlert error="Error de prueba" />);
    expect(container.firstChild).toHaveClass("bg-red-50");
    expect(container.firstChild).toHaveClass("border-red-500");
  });
});
