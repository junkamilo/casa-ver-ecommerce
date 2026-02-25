import { render, screen, fireEvent } from "@testing-library/react";
import CartFooter from "../components/CartFooter";

jest.mock("next/link", () => {
  const MockLink = ({
    href,
    children,
    onClick,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("CartFooter", () => {
  it("muestra el subtotal formateado", () => {
    render(<CartFooter subtotal={179800} onClose={jest.fn()} />);
    expect(screen.getByText("$179.800 COP")).toBeInTheDocument();
  });

  it("muestra el texto 'Total estimado'", () => {
    render(<CartFooter subtotal={50000} onClose={jest.fn()} />);
    expect(screen.getByText("Total estimado")).toBeInTheDocument();
  });

  it("tiene enlace a /checkout", () => {
    render(<CartFooter subtotal={50000} onClose={jest.fn()} />);
    const link = screen.getByRole("link", { name: /pagar/i });
    expect(link).toHaveAttribute("href", "/checkout");
  });

  it("llama a onClose al hacer click en el enlace de pago", () => {
    const onClose = jest.fn();
    render(<CartFooter subtotal={50000} onClose={onClose} />);
    fireEvent.click(screen.getByRole("link", { name: /pagar/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
