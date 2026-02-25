import { render, screen, fireEvent } from "@testing-library/react";
import AdminPageHeader from "../components/AdminPageHeader";

describe("AdminPageHeader", () => {
  it("muestra el título 'Administradores'", () => {
    render(<AdminPageHeader onNewAdmin={jest.fn()} />);
    expect(screen.getByText("Administradores")).toBeInTheDocument();
  });

  it("muestra el subtítulo de gestión", () => {
    render(<AdminPageHeader onNewAdmin={jest.fn()} />);
    expect(screen.getByText(/Gestión de accesos/)).toBeInTheDocument();
  });

  it("muestra el botón 'Nuevo Admin'", () => {
    render(<AdminPageHeader onNewAdmin={jest.fn()} />);
    expect(screen.getByRole("button", { name: /Nuevo Admin/i })).toBeInTheDocument();
  });

  it("llama a onNewAdmin al hacer click en el botón", () => {
    const onNewAdmin = jest.fn();
    render(<AdminPageHeader onNewAdmin={onNewAdmin} />);
    fireEvent.click(screen.getByRole("button", { name: /Nuevo Admin/i }));
    expect(onNewAdmin).toHaveBeenCalledTimes(1);
  });
});
