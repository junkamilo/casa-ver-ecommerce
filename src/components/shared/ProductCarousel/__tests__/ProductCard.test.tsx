import { render, screen } from "@testing-library/react";
import ProductCard from "../components/ProductCard";
import { ProductItem } from "../types";

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

jest.mock("next/image", () => {
  const MockImage = ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={typeof src === "string" ? src : "mocked"} />
  );
  MockImage.displayName = "MockImage";
  return MockImage;
});

const baseItem: ProductItem = {
  image: { src: "/product.jpg", height: 400, width: 300 },
  name: "SET TEST PRODUCTO",
  price: "$140.000",
  slug: "set-test-producto",
};

describe("ProductCard", () => {
  it("renders item name", () => {
    render(<ProductCard item={baseItem} />);
    expect(screen.getByText("SET TEST PRODUCTO")).toBeInTheDocument();
  });

  it("renders item price", () => {
    render(<ProductCard item={baseItem} />);
    expect(screen.getByText("$140.000")).toBeInTheDocument();
  });

  it("links to the correct product URL", () => {
    render(<ProductCard item={baseItem} />);
    const link = screen.getAllByRole("link")[0];
    expect(link).toHaveAttribute("href", "/product/set-test-producto");
  });

  it("renders badge when provided", () => {
    render(<ProductCard item={{ ...baseItem, badge: "Agotado" }} />);
    expect(screen.getByText("Agotado")).toBeInTheDocument();
  });

  it("does not render badge when not provided", () => {
    render(<ProductCard item={baseItem} />);
    expect(screen.queryByText("Agotado")).not.toBeInTheDocument();
  });

  it("applies red badge class for agotado badge", () => {
    render(<ProductCard item={{ ...baseItem, badge: "Agotado" }} />);
    const badge = screen.getByText("Agotado");
    expect(badge.className).toContain("bg-[#8B1A1A]");
  });

  it("applies white badge class for non-agotado badge with white variant", () => {
    render(<ProductCard item={{ ...baseItem, badge: "Nuevo" }} badgeVariant="white" />);
    const badge = screen.getByText("Nuevo");
    expect(badge.className).toContain("bg-white/95");
  });

  it("applies gold badge class for non-agotado badge with gold variant", () => {
    render(<ProductCard item={{ ...baseItem, badge: "Oferta" }} badgeVariant="gold" />);
    const badge = screen.getByText("Oferta");
    expect(badge.className).toContain("bg-[#C19A6B]");
  });

  it("renders oldPrice with line-through when provided", () => {
    render(<ProductCard item={{ ...baseItem, oldPrice: "$60.000" }} />);
    const oldPrice = screen.getByText("$60.000");
    expect(oldPrice).toBeInTheDocument();
    expect(oldPrice.className).toContain("line-through");
  });

  it("does not render oldPrice when not provided", () => {
    render(<ProductCard item={baseItem} />);
    expect(screen.queryByText("$60.000")).not.toBeInTheDocument();
  });

  it("renders rating stars and review count when provided", () => {
    render(<ProductCard item={{ ...baseItem, rating: 4, reviews: "3 reseñas" }} />);
    expect(screen.getByLabelText("4 de 5 estrellas")).toBeInTheDocument();
    expect(screen.getByText("(3 reseñas)")).toBeInTheDocument();
  });

  it("does not render rating section when not provided", () => {
    render(<ProductCard item={baseItem} />);
    expect(screen.queryByLabelText(/de 5 estrellas/)).not.toBeInTheDocument();
  });

  it("renders color swatches when colors provided", () => {
    render(
      <ProductCard item={{ ...baseItem, colors: ["#ff0000", "#00ff00"], colorLabel: "ROJO" }} />
    );
    expect(screen.getByLabelText("Colores disponibles")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^#/)).toHaveLength(2);
  });

  it("does not render color swatches when colors not provided", () => {
    render(<ProductCard item={baseItem} />);
    expect(screen.queryByLabelText("Colores disponibles")).not.toBeInTheDocument();
  });
});
