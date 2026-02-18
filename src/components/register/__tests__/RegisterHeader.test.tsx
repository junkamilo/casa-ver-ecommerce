import { render, screen } from "@testing-library/react";
import RegisterHeader from "../components/RegisterHeader";

jest.mock("next/link", () => {
  const MockLink = ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("RegisterHeader", () => {
  it("muestra el título 'Únete a Casa Verde'", () => {
    render(<RegisterHeader />);
    expect(screen.getByText("Únete a Casa Verde")).toBeInTheDocument();
  });

  it("muestra el subtítulo descriptivo", () => {
    render(<RegisterHeader />);
    expect(
      screen.getByText("Crea una cuenta para seguir tus pedidos y obtener beneficios.")
    ).toBeInTheDocument();
  });

  it("tiene enlace 'Volver al inicio' apuntando a /", () => {
    render(<RegisterHeader />);
    const link = screen.getByRole("link", { name: /Volver al inicio/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
