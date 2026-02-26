import { render, screen, fireEvent } from "@testing-library/react";
import CategoryCard from "../components/CategoryCard";
import type { Category } from "../types/types";

const mockCat: Category = {
  id: "cat-1",
  name: "Ropa Deportiva",
  slug: "ropa-deportiva",
  description: "Ropa para ejercicio",
  _count: { products: 8 },
};

describe("CategoryCard", () => {
  it("muestra el nombre de la categoría", () => {
    render(<CategoryCard category={mockCat} onDelete={jest.fn()} />);
    expect(screen.getByText("Ropa Deportiva")).toBeInTheDocument();
  });

  it("muestra el slug con /", () => {
    render(<CategoryCard category={mockCat} onDelete={jest.fn()} />);
    expect(screen.getByText("/ropa-deportiva")).toBeInTheDocument();
  });

  it("muestra la descripción", () => {
    render(<CategoryCard category={mockCat} onDelete={jest.fn()} />);
    expect(screen.getByText("Ropa para ejercicio")).toBeInTheDocument();
  });

  it("muestra 'Sin descripción' cuando no hay descripción", () => {
    const cat = { ...mockCat, description: undefined };
    render(<CategoryCard category={cat} onDelete={jest.fn()} />);
    expect(screen.getByText("Sin descripción")).toBeInTheDocument();
  });

  it("muestra el conteo de productos", () => {
    render(<CategoryCard category={mockCat} onDelete={jest.fn()} />);
    expect(screen.getByText("8 Productos")).toBeInTheDocument();
  });

  it("muestra 0 Productos cuando _count es undefined", () => {
    const cat = { ...mockCat, _count: undefined };
    render(<CategoryCard category={cat} onDelete={jest.fn()} />);
    expect(screen.getByText("0 Productos")).toBeInTheDocument();
  });

  it("llama a onDelete con el id al hacer click en el botón eliminar", () => {
    const onDelete = jest.fn();
    render(<CategoryCard category={mockCat} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onDelete).toHaveBeenCalledWith("cat-1");
  });
});
