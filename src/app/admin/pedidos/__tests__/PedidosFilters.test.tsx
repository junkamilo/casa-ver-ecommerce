import { render, screen, fireEvent } from "@testing-library/react";
import { PedidosFilters } from "../components/PedidosFilters";

const defaultProps = {
  search: "",
  onSearchChange: jest.fn(),
  statusFilter: "Todos",
  onStatusChange: jest.fn(),
  methodFilter: "Todos",
  onMethodChange: jest.fn(),
};

describe("PedidosFilters", () => {
  it("renderiza el campo de búsqueda con placeholder", () => {
    render(<PedidosFilters {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Buscar por cliente o ID/)).toBeInTheDocument();
  });

  it("muestra el valor actual del campo de búsqueda", () => {
    render(<PedidosFilters {...defaultProps} search="Carlos" />);
    expect(screen.getByDisplayValue("Carlos")).toBeInTheDocument();
  });

  it("llama a onSearchChange al escribir en el buscador", () => {
    const onSearchChange = jest.fn();
    render(<PedidosFilters {...defaultProps} onSearchChange={onSearchChange} />);
    fireEvent.change(screen.getByPlaceholderText(/Buscar por cliente o ID/), {
      target: { value: "Ana" },
    });
    expect(onSearchChange).toHaveBeenCalledWith("Ana");
  });

  it("renderiza dos selects de filtro", () => {
    render(<PedidosFilters {...defaultProps} />);
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
  });

  it("el select de estado tiene el valor 'Todos' por defecto", () => {
    render(<PedidosFilters {...defaultProps} />);
    const selects = screen.getAllByRole("combobox");
    expect(selects[0]).toHaveValue("Todos");
  });

  it("muestra el statusFilter recibido por prop", () => {
    render(<PedidosFilters {...defaultProps} statusFilter="Pagado" />);
    const selects = screen.getAllByRole("combobox");
    expect(selects[0]).toHaveValue("Pagado");
  });

  it("llama a onStatusChange al cambiar el estado", () => {
    const onStatusChange = jest.fn();
    render(<PedidosFilters {...defaultProps} onStatusChange={onStatusChange} />);
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "Enviado" } });
    expect(onStatusChange).toHaveBeenCalledWith("Enviado");
  });

  it("llama a onMethodChange al cambiar el método de pago", () => {
    const onMethodChange = jest.fn();
    render(<PedidosFilters {...defaultProps} onMethodChange={onMethodChange} />);
    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: "Nequi" } });
    expect(onMethodChange).toHaveBeenCalledWith("Nequi");
  });

  it("renderiza la opción 'Pagado' en el select de estados", () => {
    render(<PedidosFilters {...defaultProps} />);
    expect(screen.getByRole("option", { name: "Pagado" })).toBeInTheDocument();
  });

  it("renderiza la opción 'Nequi' en el select de métodos", () => {
    render(<PedidosFilters {...defaultProps} />);
    expect(screen.getByRole("option", { name: "Nequi" })).toBeInTheDocument();
  });

  it("renderiza todas las opciones de estado", () => {
    render(<PedidosFilters {...defaultProps} />);
    ["Todos", "Pagado", "Pendiente", "Enviado", "Entregado", "Cancelado"].forEach((s) => {
      expect(screen.getByRole("option", { name: s })).toBeInTheDocument();
    });
  });
});
