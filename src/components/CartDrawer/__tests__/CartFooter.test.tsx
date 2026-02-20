import { render, screen, fireEvent } from "@testing-library/react";
import { CartFooter } from "../components/CartFooter";

// Mock de next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

describe("CartFooter", () => {
  it("no renderiza cuando itemCount es 0", () => {
    const { container } = render(
      <CartFooter subtotal={100000} itemCount={0} onCheckout={jest.fn()} />
    );

    expect(container.firstChild?.childNodes.length).toBe(0);
  });

  it("renderiza cuando hay items", () => {
    render(<CartFooter subtotal={100000} itemCount={1} onCheckout={jest.fn()} />);

    expect(screen.getByText("Total estimado")).toBeInTheDocument();
  });

  it("muestra el subtotal correctamente", () => {
    render(<CartFooter subtotal={250000} itemCount={1} onCheckout={jest.fn()} />);

    expect(screen.getByText("$250,000 COP")).toBeInTheDocument();
  });

  it("muestra el mensaje de impuestos y envío", () => {
    render(<CartFooter subtotal={100000} itemCount={1} onCheckout={jest.fn()} />);

    expect(
      screen.getByText("Los impuestos y los gastos de envío se calculan en la página de pago.")
    ).toBeInTheDocument();
  });

  it("renderiza el botón Pagar", () => {
    render(<CartFooter subtotal={100000} itemCount={1} onCheckout={jest.fn()} />);

    const payButton = screen.getByText("Pagar");
    expect(payButton).toBeInTheDocument();
  });

  it("el botón Pagar apunta a /checkout", () => {
    render(<CartFooter subtotal={100000} itemCount={1} onCheckout={jest.fn()} />);

    const payButton = screen.getByText("Pagar");
    expect(payButton).toHaveAttribute("href", "/checkout");
  });

  it("llama onCheckout cuando se hace click en Pagar", () => {
    const onCheckout = jest.fn();
    render(<CartFooter subtotal={100000} itemCount={1} onCheckout={onCheckout} />);

    const payButton = screen.getByText("Pagar");
    fireEvent.click(payButton);

    expect(onCheckout).toHaveBeenCalled();
  });

  it("formate el subtotal con puntos separadores de miles", () => {
    render(<CartFooter subtotal={1234567} itemCount={1} onCheckout={jest.fn()} />);

    expect(screen.getByText("$1,234,567 COP")).toBeInTheDocument();
  });

  it("tiene estilo gold-gradient en el botón", () => {
    const { container } = render(
      <CartFooter subtotal={100000} itemCount={1} onCheckout={jest.fn()} />
    );

    const button = container.querySelector(".gold-gradient");
    expect(button).toBeInTheDocument();
  });
});
