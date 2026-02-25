import { render, screen, fireEvent } from "@testing-library/react";
import AdminToast from "../components/AdminToast";

describe("AdminToast", () => {
  it("no renderiza nada cuando toast es null", () => {
    const { container } = render(<AdminToast toast={null} onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra mensaje de éxito", () => {
    render(<AdminToast toast={{ type: "success", message: "Admin creado" }} onClose={jest.fn()} />);
    expect(screen.getByText("Admin creado")).toBeInTheDocument();
  });

  it("muestra mensaje de error", () => {
    render(<AdminToast toast={{ type: "error", message: "Error al crear" }} onClose={jest.fn()} />);
    expect(screen.getByText("Error al crear")).toBeInTheDocument();
  });

  it("aplica clases verdes para success", () => {
    const { container } = render(
      <AdminToast toast={{ type: "success", message: "OK" }} onClose={jest.fn()} />
    );
    expect(container.firstChild).toHaveClass("bg-emerald-50");
  });

  it("aplica clases rojas para error", () => {
    const { container } = render(
      <AdminToast toast={{ type: "error", message: "Error" }} onClose={jest.fn()} />
    );
    expect(container.firstChild).toHaveClass("bg-red-50");
  });

  it("llama a onClose al hacer click en el botón X", () => {
    const onClose = jest.fn();
    render(<AdminToast toast={{ type: "success", message: "OK" }} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
