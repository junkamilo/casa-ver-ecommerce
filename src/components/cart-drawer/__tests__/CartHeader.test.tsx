import { render, screen, fireEvent } from "@testing-library/react";
import CartHeader from "../components/CartHeader";

describe("CartHeader", () => {
  it("muestra el título 'Carrito'", () => {
    render(<CartHeader cartCount={3} onClose={jest.fn()} />);
    expect(screen.getByText("Carrito")).toBeInTheDocument();
  });

  it("muestra el conteo de items en el badge", () => {
    render(<CartHeader cartCount={5} onClose={jest.fn()} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("muestra 0 en el badge cuando el carrito está vacío", () => {
    render(<CartHeader cartCount={0} onClose={jest.fn()} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("llama a onClose al hacer click en el botón X", () => {
    const onClose = jest.fn();
    render(<CartHeader cartCount={2} onClose={onClose} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
