import { render, screen } from "@testing-library/react";
import RegisterFooter from "../components/RegisterFooter";

jest.mock("next/link", () => {
  const MockLink = ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("RegisterFooter", () => {
  it("muestra el texto para usuarios con cuenta existente", () => {
    render(<RegisterFooter />);
    expect(screen.getByText(/¿Ya tienes cuenta?/)).toBeInTheDocument();
  });

  it("contiene enlace a /login", () => {
    render(<RegisterFooter />);
    const link = screen.getByRole("link", { name: /Inicia sesión aquí/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});
