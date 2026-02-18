import { render, screen, fireEvent } from "@testing-library/react";
import ProductsHeader from "../components/ProductsHeader";

describe("ProductsHeader", () => {
  it("muestra el título Inventario", () => {
    render(<ProductsHeader onNew={jest.fn()} />);
    expect(screen.getByText("Inventario")).toBeInTheDocument();
  });

  it("muestra el botón de Nuevo Producto", () => {
    render(<ProductsHeader onNew={jest.fn()} />);
    expect(screen.getByText("Nuevo Producto")).toBeInTheDocument();
  });

  it("llama onNew al hacer click en el botón", () => {
    const onNew = jest.fn();
    render(<ProductsHeader onNew={onNew} />);
    fireEvent.click(screen.getByText("Nuevo Producto"));
    expect(onNew).toHaveBeenCalledTimes(1);
  });
});
