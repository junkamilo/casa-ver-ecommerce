import { render, screen } from "@testing-library/react";
import CheckoutFooterLinks from "../components/CheckoutFooterLinks";

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("CheckoutFooterLinks", () => {
  it("renders all footer links", () => {
    render(<CheckoutFooterLinks />);
    expect(screen.getByText("Reembolsos")).toBeInTheDocument();
    expect(screen.getByText("Envíos")).toBeInTheDocument();
    expect(screen.getByText("Privacidad")).toBeInTheDocument();
    expect(screen.getByText("Términos")).toBeInTheDocument();
  });

  it("renders 4 anchor tags", () => {
    render(<CheckoutFooterLinks />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
  });
});
