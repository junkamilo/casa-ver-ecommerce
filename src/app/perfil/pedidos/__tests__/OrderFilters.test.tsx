import { render, screen, fireEvent } from "@testing-library/react";
import { OrderFilters } from "../components/OrderFilters";

const mockCountByStatus = {
  ALL: 5,
  PENDING: 1,
  PROCESSING: 1,
  SHIPPED: 1,
  DELIVERED: 1,
  CANCELLED: 1,
};

describe("OrderFilters", () => {
  it("renderiza el botón Todos", () => {
    render(
      <OrderFilters active="ALL" onChange={jest.fn()} countByStatus={mockCountByStatus} />
    );
    expect(screen.getByText("Todos")).toBeInTheDocument();
  });

  it("llama onChange con el filtro correcto al hacer click", () => {
    const onChange = jest.fn();
    render(
      <OrderFilters active="ALL" onChange={onChange} countByStatus={mockCountByStatus} />
    );

    fireEvent.click(screen.getByText("Pendientes"));
    expect(onChange).toHaveBeenCalledWith("PENDING");
  });

  it("aplica estilos activos al filtro seleccionado", () => {
    render(
      <OrderFilters active="DELIVERED" onChange={jest.fn()} countByStatus={mockCountByStatus} />
    );
    const entregadosBtn = screen.getByText("Entregados").closest("button");
    expect(entregadosBtn?.className).toContain("bg-[#154734]");
  });

  it("no aplica estilos activos a los filtros inactivos", () => {
    render(
      <OrderFilters active="ALL" onChange={jest.fn()} countByStatus={mockCountByStatus} />
    );
    const pendientesBtn = screen.getByText("Pendientes").closest("button");
    expect(pendientesBtn?.className).not.toContain("bg-[#154734]");
  });

  it("muestra el conteo de pedidos en cada filtro", () => {
    render(
      <OrderFilters active="ALL" onChange={jest.fn()} countByStatus={mockCountByStatus} />
    );
    // El total ALL = 5 debe aparecer
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("no renderiza filtros sin pedidos", () => {
    const countWithoutConfirmed = { ALL: 2, PENDING: 1, DELIVERED: 1 };
    render(
      <OrderFilters active="ALL" onChange={jest.fn()} countByStatus={countWithoutConfirmed} />
    );
    expect(screen.queryByText("En proceso")).not.toBeInTheDocument();
  });
});
