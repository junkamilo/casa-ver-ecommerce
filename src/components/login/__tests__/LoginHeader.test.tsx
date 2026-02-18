import { render, screen } from "@testing-library/react";
import LoginHeader from "../components/LoginHeader";

jest.mock("next/link", () => {
  const MockLink = ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("LoginHeader", () => {
  it("muestra el título 'Bienvenido de nuevo'", () => {
    render(<LoginHeader />);
    expect(screen.getByText("Bienvenido de nuevo")).toBeInTheDocument();
  });

  it("muestra el subtítulo descriptivo", () => {
    render(<LoginHeader />);
    expect(
      screen.getByText("Ingresa a tu cuenta para gestionar tus pedidos")
    ).toBeInTheDocument();
  });

  it("tiene enlace 'Volver al inicio' apuntando a /", () => {
    render(<LoginHeader />);
    const link = screen.getByRole("link", { name: /Volver al inicio/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
