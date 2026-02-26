import { render, screen, fireEvent } from "@testing-library/react";
import { FilterSidebar } from "../components/FilterSidebar";

const defaultProps = {
  isAvailabilityOpen: true,
  onToggleAvailability: jest.fn(),
  isPriceOpen: true,
  onTogglePrice: jest.fn(),
};

describe("FilterSidebar", () => {
  it("muestra el título 'Filtros'", () => {
    render(<FilterSidebar {...defaultProps} />);
    expect(screen.getByText("Filtros")).toBeInTheDocument();
  });

  it("muestra el filtro de Disponibilidad", () => {
    render(<FilterSidebar {...defaultProps} />);
    expect(screen.getByText("Disponibilidad")).toBeInTheDocument();
  });

  it("muestra el filtro de Precio", () => {
    render(<FilterSidebar {...defaultProps} />);
    expect(screen.getByText("Precio")).toBeInTheDocument();
  });

  it("muestra las opciones de disponibilidad cuando isAvailabilityOpen es true", () => {
    render(<FilterSidebar {...defaultProps} isAvailabilityOpen={true} />);
    expect(screen.getByText("En existencia")).toBeInTheDocument();
    expect(screen.getByText("Agotado")).toBeInTheDocument();
  });

  it("oculta las opciones de disponibilidad cuando isAvailabilityOpen es false", () => {
    render(<FilterSidebar {...defaultProps} isAvailabilityOpen={false} />);
    expect(screen.queryByText("En existencia")).not.toBeInTheDocument();
    expect(screen.queryByText("Agotado")).not.toBeInTheDocument();
  });

  it("muestra el rango de precio cuando isPriceOpen es true", () => {
    render(<FilterSidebar {...defaultProps} isPriceOpen={true} />);
    expect(screen.getByText(/El precio más alto/)).toBeInTheDocument();
  });

  it("oculta el rango de precio cuando isPriceOpen es false", () => {
    render(<FilterSidebar {...defaultProps} isPriceOpen={false} />);
    expect(screen.queryByText(/El precio más alto/)).not.toBeInTheDocument();
  });

  it("llama a onToggleAvailability al hacer click en el botón Disponibilidad", () => {
    const onToggleAvailability = jest.fn();
    render(<FilterSidebar {...defaultProps} onToggleAvailability={onToggleAvailability} />);
    fireEvent.click(screen.getByText("Disponibilidad"));
    expect(onToggleAvailability).toHaveBeenCalledTimes(1);
  });

  it("llama a onTogglePrice al hacer click en el botón Precio", () => {
    const onTogglePrice = jest.fn();
    render(<FilterSidebar {...defaultProps} onTogglePrice={onTogglePrice} />);
    fireEvent.click(screen.getByText("Precio"));
    expect(onTogglePrice).toHaveBeenCalledTimes(1);
  });

  it("muestra dos checkboxes cuando la disponibilidad está abierta", () => {
    render(<FilterSidebar {...defaultProps} isAvailabilityOpen={true} />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
  });
});
