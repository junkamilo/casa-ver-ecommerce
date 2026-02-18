import { render, screen } from "@testing-library/react";
import SectionHeader from "../components/SectionHeader";

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("SectionHeader", () => {
  it("renders the section title", () => {
    render(<SectionHeader />);
    expect(screen.getByText("MÁS VENDIDOS")).toBeInTheDocument();
  });

  it("renders the 'Ver todo' link", () => {
    render(<SectionHeader />);
    const link = screen.getByRole("link", { name: /ver todo/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/collections/mas-vendidos");
  });
});
