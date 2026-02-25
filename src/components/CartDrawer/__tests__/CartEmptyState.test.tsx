import { render, screen, fireEvent } from "@testing-library/react";
import { CartEmptyState } from "../components/CartEmptyState";

describe("CartEmptyState", () => {
  it("renderiza el mensaje de carrito vacío", () => {
    render(<CartEmptyState onContinueShopping={jest.fn()} />);
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
  });

  it("renderiza el ícono de bolsa de compras", () => {
    const { container } = render(<CartEmptyState onContinueShopping={jest.fn()} />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("renderiza el botón Seguir comprando", () => {
    render(<CartEmptyState onContinueShopping={jest.fn()} />);
    const button = screen.getByText("Seguir comprando");
    expect(button).toBeInTheDocument();
  });

  it("llama onContinueShopping cuando se hace click en el botón", () => {
    const onContinueShopping = jest.fn();
    render(<CartEmptyState onContinueShopping={onContinueShopping} />);

    const button = screen.getByText("Seguir comprando");
    fireEvent.click(button);

    expect(onContinueShopping).toHaveBeenCalled();
  });

  it("tiene aria-label en el botón", () => {
    render(<CartEmptyState onContinueShopping={jest.fn()} />);
    const button = screen.getByLabelText("Volver a comprar");
    expect(button).toBeInTheDocument();
  });

  it("tiene estilo de opacity reducida", () => {
    const { container } = render(<CartEmptyState onContinueShopping={jest.fn()} />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("opacity-60");
  });
});
