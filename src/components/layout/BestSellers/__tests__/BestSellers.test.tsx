import { render, screen } from "@testing-library/react";
import BestSellers from "../index";
import { products } from "../data";

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

describe("BestSellers", () => {
  it("renders the section title", () => {
    render(<BestSellers />);
    expect(screen.getByText("MÁS VENDIDOS")).toBeInTheDocument();
  });

  it("renders the 'Ver todo' link pointing to /collections/mas-vendidos", () => {
    render(<BestSellers />);
    const link = screen.getByRole("link", { name: /ver todo/i });
    expect(link).toHaveAttribute("href", "/collections/mas-vendidos");
  });

  it("renders all product cards", () => {
    render(<BestSellers />);
    products.forEach((product) => {
      expect(screen.getAllByAltText(product.name).length).toBeGreaterThan(0);
    });
  });

  it("renders product links with correct hrefs", () => {
    render(<BestSellers />);
    const productLinks = screen.getAllByRole("link").filter((link) =>
      link.getAttribute("href")?.startsWith("/product/")
    );
    expect(productLinks.length).toBe(products.length);
  });

  it("does not render scroll arrows initially (jsdom has no scroll width)", () => {
    render(<BestSellers />);
    expect(screen.queryByRole("button", { name: "Anterior" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Siguiente" })).not.toBeInTheDocument();
  });
});
