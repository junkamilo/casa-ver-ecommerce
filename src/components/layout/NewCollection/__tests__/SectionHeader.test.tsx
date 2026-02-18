import { render, screen } from "@testing-library/react";
import SectionHeader from "../components/SectionHeader";

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

describe("SectionHeader (NewCollection)", () => {
  it("renders the section title", () => {
    render(<SectionHeader />);
    expect(screen.getByText("NUEVA COLECCIÓN")).toBeInTheDocument();
  });

  it("renders the 'Ver todo' link pointing to /collections/nueva-coleccion", () => {
    render(<SectionHeader />);
    const link = screen.getByRole("link", { name: /ver todo/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/collections/nueva-coleccion");
  });
});
