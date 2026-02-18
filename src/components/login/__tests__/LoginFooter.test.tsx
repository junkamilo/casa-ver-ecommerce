import { render, screen } from "@testing-library/react";
import LoginFooter from "../components/LoginFooter";

jest.mock("next/link", () => {
  const MockLink = ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("LoginFooter", () => {
  it("muestra el texto de registro", () => {
    render(<LoginFooter />);
    expect(screen.getByText(/¿No tienes una cuenta?/)).toBeInTheDocument();
  });

  it("contiene enlace a /registro", () => {
    render(<LoginFooter />);
    const link = screen.getByRole("link", { name: /Regístrate aquí/i });
    expect(link).toHaveAttribute("href", "/registro");
  });
});
