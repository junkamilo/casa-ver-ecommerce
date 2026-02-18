import { render, screen } from "@testing-library/react";
import ToastNotification from "../components/ToastNotification";

describe("ToastNotification", () => {
  it("no renderiza nada cuando toast es null", () => {
    const { container } = render(<ToastNotification toast={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra mensaje de éxito", () => {
    render(
      <ToastNotification toast={{ type: "success", message: "Producto creado" }} />
    );
    expect(screen.getByText("Producto creado")).toBeInTheDocument();
  });

  it("muestra mensaje de error", () => {
    render(
      <ToastNotification toast={{ type: "error", message: "Error al guardar" }} />
    );
    expect(screen.getByText("Error al guardar")).toBeInTheDocument();
  });

  it("aplica clases de color verde para success", () => {
    const { container } = render(
      <ToastNotification toast={{ type: "success", message: "OK" }} />
    );
    expect(container.firstChild).toHaveClass("bg-emerald-50");
  });

  it("aplica clases de color rojo para error", () => {
    const { container } = render(
      <ToastNotification toast={{ type: "error", message: "Error" }} />
    );
    expect(container.firstChild).toHaveClass("bg-red-50");
  });
});
