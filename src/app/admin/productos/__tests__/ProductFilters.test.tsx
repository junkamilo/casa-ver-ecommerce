import { render, screen, fireEvent } from "@testing-library/react";
import ProductFilters from "../components/ProductFilters";

const categories = [
  { id: "1", name: "Enterizos" },
  { id: "2", name: "Sets" },
];

describe("ProductFilters", () => {
  it("renderiza el input de búsqueda", () => {
    render(
      <ProductFilters
        search=""
        onSearchChange={jest.fn()}
        filterCategory="Todos"
        onCategoryChange={jest.fn()}
        categories={categories}
      />
    );
    expect(screen.getByPlaceholderText("Buscar producto...")).toBeInTheDocument();
  });

  it("renderiza las categorías en el select", () => {
    render(
      <ProductFilters
        search=""
        onSearchChange={jest.fn()}
        filterCategory="Todos"
        onCategoryChange={jest.fn()}
        categories={categories}
      />
    );
    expect(screen.getByText("Enterizos")).toBeInTheDocument();
    expect(screen.getByText("Sets")).toBeInTheDocument();
  });

  it("llama onSearchChange al escribir en el input", () => {
    const onSearchChange = jest.fn();
    render(
      <ProductFilters
        search=""
        onSearchChange={onSearchChange}
        filterCategory="Todos"
        onCategoryChange={jest.fn()}
        categories={[]}
      />
    );
    fireEvent.change(screen.getByPlaceholderText("Buscar producto..."), {
      target: { value: "enterizo" },
    });
    expect(onSearchChange).toHaveBeenCalledWith("enterizo");
  });

  it("llama onCategoryChange al cambiar el select", () => {
    const onCategoryChange = jest.fn();
    render(
      <ProductFilters
        search=""
        onSearchChange={jest.fn()}
        filterCategory="Todos"
        onCategoryChange={onCategoryChange}
        categories={categories}
      />
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Enterizos" },
    });
    expect(onCategoryChange).toHaveBeenCalledWith("Enterizos");
  });
});
