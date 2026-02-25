import { render, screen } from "@testing-library/react";
import NewCollection from "../index";
import { items } from "../data";

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

describe("NewCollection", () => {
  it("renders the section eyebrow", () => {
    render(<NewCollection />);
    expect(screen.getByText("Lanzamientos")).toBeInTheDocument();
  });

  it("renders the italic title part", () => {
    render(<NewCollection />);
    expect(screen.getByText("Colección")).toBeInTheDocument();
  });

  it("renders the 'VER TODO' link pointing to /collections/nueva-coleccion", () => {
    render(<NewCollection />);
    const link = screen.getByRole("link", { name: /VER TODO/i });
    expect(link).toHaveAttribute("href", "/collections/nueva-coleccion");
  });

  it("renders all collection cards", () => {
    render(<NewCollection />);
    items.forEach((item) => {
      expect(screen.getByAltText(item.name)).toBeInTheDocument();
    });
  });

  it("renders product links with correct hrefs", () => {
    render(<NewCollection />);
    const productLinks = screen.getAllByRole("link").filter((link) =>
      link.getAttribute("href")?.startsWith("/product/")
    );
    expect(productLinks.length).toBe(items.length * 2);
  });

  it("does not render scroll arrows initially (jsdom has no scroll width)", () => {
    render(<NewCollection />);
    expect(screen.queryByRole("button", { name: "Anterior" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Siguiente" })).not.toBeInTheDocument();
  });
});
