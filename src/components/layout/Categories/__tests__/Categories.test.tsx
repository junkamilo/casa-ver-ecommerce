import { render, screen } from "@testing-library/react";
import Categories from "../index";
import { CATEGORIES } from "../constants";

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

jest.mock("next/image", () => {
  const MockImage = ({ alt }: { alt: string }) => <img alt={alt} src="mocked" />;
  MockImage.displayName = "MockImage";
  return MockImage;
});

describe("Categories", () => {
  it("renders the section title", () => {
    render(<Categories />);
    expect(screen.getByText("CATEGORÍAS")).toBeInTheDocument();
  });

  it("renders the 'Ver todo' link pointing to /collections", () => {
    render(<Categories />);
    const link = screen.getByRole("link", { name: /ver todo/i });
    expect(link).toHaveAttribute("href", "/collections");
  });

  it("renders all category cards", () => {
    render(<Categories />);
    CATEGORIES.forEach((cat) => {
      expect(screen.getByAltText(cat.label)).toBeInTheDocument();
    });
  });

  it("renders the correct number of category links", () => {
    render(<Categories />);
    const categoryLinks = screen.getAllByRole("link").filter((link) =>
      link.getAttribute("href")?.startsWith("/collections/")
    );
    expect(categoryLinks.length).toBe(CATEGORIES.length);
  });

  it("renders category links with correct slugs", () => {
    render(<Categories />);
    CATEGORIES.forEach((cat) => {
      expect(screen.getByAltText(cat.label).closest("a")).toHaveAttribute(
        "href",
        `/collections/${cat.slug}`
      );
    });
  });

  it("does not render scroll arrows initially (jsdom has no scroll width)", () => {
    render(<Categories />);
    expect(screen.queryByRole("button", { name: "Anterior" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Siguiente" })).not.toBeInTheDocument();
  });
});
