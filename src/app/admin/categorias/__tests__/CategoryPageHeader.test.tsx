import { render, screen, fireEvent } from "@testing-library/react";
import CategoryPageHeader from "../components/CategoryPageHeader";

describe("CategoryPageHeader", () => {
  it("muestra el título 'Categorías'", () => {
    render(<CategoryPageHeader onNew={jest.fn()} />);
    expect(screen.getByText("Categorías")).toBeInTheDocument();
  });

  it("muestra el subtítulo", () => {
    render(<CategoryPageHeader onNew={jest.fn()} />);
    expect(screen.getByText(/Organiza tu catálogo/)).toBeInTheDocument();
  });

  it("llama a onNew al hacer click en el botón", () => {
    const onNew = jest.fn();
    render(<CategoryPageHeader onNew={onNew} />);
    fireEvent.click(screen.getByRole("button", { name: /Nueva Categoría/i }));
    expect(onNew).toHaveBeenCalledTimes(1);
  });
});
