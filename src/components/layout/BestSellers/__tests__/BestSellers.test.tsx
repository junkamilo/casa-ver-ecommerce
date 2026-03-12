import { render, screen } from "@testing-library/react";
import { fetchFeaturedProducts } from "../index";
import BestSellers from "../index";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: jest.fn().mockResolvedValue([
        {
          id: "1",
          name: "SET AURORA",
          slug: "set-aurora",
          basePrice: 190000,
          comparePrice: null,
          colors: [
            {
              id: "c1",
              name: "BEIGE",
              hexCode: "#d4c4a8",
              images: [{ url: "https://res.cloudinary.com/test/image/upload/v1/aurora.jpg" }],
              variants: [{ stock: 5 }],
            },
          ],
          images: [],
        },
        {
          id: "2",
          name: "SET PANT ICON",
          slug: "set-pant-icon",
          basePrice: 185000,
          comparePrice: 200000,
          colors: [
            {
              id: "c2",
              name: "AZUL BEBÉ",
              hexCode: "#a8d4f0",
              images: [],
              variants: [{ stock: 0 }],
            },
          ],
          images: [{ url: "https://res.cloudinary.com/test/image/upload/v1/icon.jpg" }],
        },
      ]),
    },
  },
}));

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

describe("fetchFeaturedProducts", () => {
  it("returns mapped ProductItem array from prisma", async () => {
    const items = await fetchFeaturedProducts();
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe("SET AURORA");
    expect(items[0].slug).toBe("set-aurora");
    expect(items[0].price).toBe("$190.000");
    expect(items[0].badge).toBeUndefined(); // stock > 0
    expect(items[1].badge).toBe("Agotado"); // stock === 0
    expect(items[1].oldPrice).toBe("$200.000");
  });

  it("uses first color image when available", async () => {
    const items = await fetchFeaturedProducts();
    expect(items[0].image).toBe(
      "https://res.cloudinary.com/test/image/upload/v1/aurora.jpg"
    );
  });

  it("falls back to general image when no color image", async () => {
    const items = await fetchFeaturedProducts();
    expect(items[1].image).toBe(
      "https://res.cloudinary.com/test/image/upload/v1/icon.jpg"
    );
  });
});

describe("BestSellers", () => {
  it("renders the section eyebrow", async () => {
    const jsx = await BestSellers();
    render(jsx);
    expect(screen.getByText("Descubre")).toBeInTheDocument();
  });

  it("renders the italic title part", async () => {
    const jsx = await BestSellers();
    render(jsx);
    expect(screen.getByText("Deseados")).toBeInTheDocument();
  });

  it("renders the 'VER COLECCIÓN' link pointing to /collections/mas-vendidos", async () => {
    const jsx = await BestSellers();
    render(jsx);
    const link = screen.getByRole("link", { name: /VER COLECCIÓN/i });
    expect(link).toHaveAttribute("href", "/collections/mas-vendidos");
  });

  it("renders all product cards with correct links", async () => {
    const jsx = await BestSellers();
    render(jsx);
    const productLinks = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("/product/"));
    expect(productLinks.length).toBeGreaterThan(0);
    expect(
      productLinks.some((l) => l.getAttribute("href") === "/product/set-aurora")
    ).toBe(true);
  });

  it("does not render scroll arrows initially (jsdom has no scroll width)", async () => {
    const jsx = await BestSellers();
    render(jsx);
    expect(screen.queryByRole("button", { name: "Anterior" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Siguiente" })).not.toBeInTheDocument();
  });
});
