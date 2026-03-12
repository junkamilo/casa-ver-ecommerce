import { render, screen, fireEvent } from "@testing-library/react";
import CategoryCard from "../components/CategoryCard";
import type { Category } from "../types/types";

const mockCat: Category = {
  id: "cat-1",
  name: "Ropa Deportiva",
  slug: "ropa-deportiva",
  description: "Ropa para ejercicio",
  isActive: true,
  _count: { products: 8 },
};

describe("CategoryCard", () => {
  it("muestra el nombre de la categoría", () => {
    render(<CategoryCard category={mockCat} onEdit={jest.fn()} onToggleActive={jest.fn()} />);
    expect(screen.getByText("Ropa Deportiva")).toBeInTheDocument();
  });

  it("muestra la descripción", () => {
    render(<CategoryCard category={mockCat} onEdit={jest.fn()} onToggleActive={jest.fn()} />);
    expect(screen.getByText("Ropa para ejercicio")).toBeInTheDocument();
  });

  it("muestra 'Sin descripción' cuando no hay descripción", () => {
    const cat = { ...mockCat, description: undefined };
    render(<CategoryCard category={cat} onEdit={jest.fn()} onToggleActive={jest.fn()} />);
    expect(screen.getByText("Sin descripción asignada para esta colección.")).toBeInTheDocument();
  });

  it("muestra el conteo de productos", () => {
    render(<CategoryCard category={mockCat} onEdit={jest.fn()} onToggleActive={jest.fn()} />);
    expect(screen.getByText("8 Productos")).toBeInTheDocument();
  });

  it("muestra 0 Productos cuando _count es undefined", () => {
    const cat = { ...mockCat, _count: undefined };
    render(<CategoryCard category={cat} onEdit={jest.fn()} onToggleActive={jest.fn()} />);
    expect(screen.getByText("0 Productos")).toBeInTheDocument();
  });

  it("muestra badge 'Activa' cuando isActive es true", () => {
    render(<CategoryCard category={mockCat} onEdit={jest.fn()} onToggleActive={jest.fn()} />);
    expect(screen.getByText("Activa")).toBeInTheDocument();
  });

  it("muestra badge 'Oculta' cuando isActive es false", () => {
    const cat = { ...mockCat, isActive: false };
    render(<CategoryCard category={cat} onEdit={jest.fn()} onToggleActive={jest.fn()} />);
    expect(screen.getByText("Oculta")).toBeInTheDocument();
  });

  it("llama a onEdit con la categoría al hacer click en el botón editar", () => {
    const onEdit = jest.fn();
    render(<CategoryCard category={mockCat} onEdit={onEdit} onToggleActive={jest.fn()} />);
    fireEvent.click(screen.getByTitle("Editar colección"));
    expect(onEdit).toHaveBeenCalledWith(mockCat);
  });

  it("llama a onToggleActive con la categoría al hacer click en el botón de visibilidad", () => {
    const onToggleActive = jest.fn();
    render(<CategoryCard category={mockCat} onEdit={jest.fn()} onToggleActive={onToggleActive} />);
    fireEvent.click(screen.getByTitle("Ocultar colección"));
    expect(onToggleActive).toHaveBeenCalledWith(mockCat);
  });
});
