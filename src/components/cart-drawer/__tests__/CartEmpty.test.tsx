import { render, screen, fireEvent } from "@testing-library/react";
import CartEmpty from "../components/CartEmpty";

describe("CartEmpty", () => {
  it("muestra el mensaje de carrito vacío", () => {
    render(<CartEmpty onClose={jest.fn()} />);
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
  });

  it("muestra el botón 'Seguir comprando'", () => {
    render(<CartEmpty onClose={jest.fn()} />);
    expect(screen.getByText("Seguir comprando")).toBeInTheDocument();
  });

  it("llama a onClose al hacer click en 'Seguir comprando'", () => {
    const onClose = jest.fn();
    render(<CartEmpty onClose={onClose} />);
    fireEvent.click(screen.getByText("Seguir comprando"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
