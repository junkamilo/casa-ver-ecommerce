import { render, screen, fireEvent } from "@testing-library/react";
import { CartHeader } from "../components/CartHeader";

describe("CartHeader", () => {
  it("renderiza el título Carrito", () => {
    render(<CartHeader cartCount={0} onClose={jest.fn()} />);
    expect(screen.getByText("Carrito")).toBeInTheDocument();
  });

  it("muestra el badge con la cantidad de items", () => {
    render(<CartHeader cartCount={3} onClose={jest.fn()} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renderiza el botón cerrar", () => {
    render(<CartHeader cartCount={0} onClose={jest.fn()} />);
    const closeButton = screen.getByLabelText("Cerrar carrito");
    expect(closeButton).toBeInTheDocument();
  });

  it("llama onClose cuando se hace click en el botón cerrar", () => {
    const onClose = jest.fn();
    render(<CartHeader cartCount={0} onClose={onClose} />);

    const closeButton = screen.getByLabelText("Cerrar carrito");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("muestra diferentes cantidades en el badge", () => {
    const { rerender } = render(<CartHeader cartCount={1} onClose={jest.fn()} />);
    expect(screen.getByText("1")).toBeInTheDocument();

    rerender(<CartHeader cartCount={5} onClose={jest.fn()} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("tiene border-bottom", () => {
    const { container } = render(<CartHeader cartCount={0} onClose={jest.fn()} />);
    const header = container.querySelector(".border-b");
    expect(header).toBeInTheDocument();
  });
});
