import { render, screen } from "@testing-library/react";
import CategoryToast from "../components/CategoryToast";

describe("CategoryToast", () => {
  it("no renderiza nada cuando toast es null", () => {
    const { container } = render(<CategoryToast toast={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra mensaje de éxito", () => {
    render(<CategoryToast toast={{ type: "success", message: "Categoría creada" }} />);
    expect(screen.getByText("Categoría creada")).toBeInTheDocument();
  });

  it("muestra mensaje de error", () => {
    render(<CategoryToast toast={{ type: "error", message: "Error al crear" }} />);
    expect(screen.getByText("Error al crear")).toBeInTheDocument();
  });

  it("aplica clases verdes para success", () => {
    const { container } = render(
      <CategoryToast toast={{ type: "success", message: "OK" }} />
    );
    expect(container.firstChild).toHaveClass("bg-emerald-50");
  });

  it("aplica clases rojas para error", () => {
    const { container } = render(
      <CategoryToast toast={{ type: "error", message: "Error" }} />
    );
    expect(container.firstChild).toHaveClass("bg-red-50");
  });
});
