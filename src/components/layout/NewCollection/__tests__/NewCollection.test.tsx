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
  it("renders the section title", () => {
    render(<NewCollection />);
    expect(screen.getByText("NUEVA COLECCIÓN")).toBeInTheDocument();
  });

  it("renders the 'Ver todo' link pointing to /collections/nueva-coleccion", () => {
    render(<NewCollection />);
    const link = screen.getByRole("link", { name: /ver todo/i });
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
    expect(productLinks.length).toBe(items.length);
  });

  it("does not render scroll arrows initially (jsdom has no scroll width)", () => {
    render(<NewCollection />);
    expect(screen.queryByRole("button", { name: "Anterior" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Siguiente" })).not.toBeInTheDocument();
  });
});
