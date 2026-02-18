import { render, screen } from "@testing-library/react";
import ProductCard from "../components/ProductCard";
import { ProductCard as ProductCardType } from "../types/types";

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

const baseProduct: ProductCardType = {
  image: { src: "/product.jpg", height: 400, width: 300 },
  name: "SET TEST PRODUCTO",
  price: "$140.000",
  slug: "set-test-producto",
};

describe("ProductCard", () => {
  it("renders product name", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("SET TEST PRODUCTO")).toBeInTheDocument();
  });

  it("renders product price", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.getByText("$140.000")).toBeInTheDocument();
  });

  it("links to the correct product URL", () => {
    render(<ProductCard product={baseProduct} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/product/set-test-producto");
  });

  it("renders badge when provided", () => {
    render(<ProductCard product={{ ...baseProduct, badge: "Agotado" }} />);
    expect(screen.getByText("Agotado")).toBeInTheDocument();
  });

  it("does not render badge when not provided", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.queryByText("Agotado")).not.toBeInTheDocument();
  });

  it("renders rating stars and review count when provided", () => {
    render(
      <ProductCard product={{ ...baseProduct, rating: 4, reviews: "3 reseñas" }} />
    );
    expect(screen.getByLabelText("4 de 5 estrellas")).toBeInTheDocument();
    expect(screen.getByText("(3 reseñas)")).toBeInTheDocument();
  });

  it("does not render rating section when not provided", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.queryByLabelText(/de 5 estrellas/)).not.toBeInTheDocument();
  });

  it("renders color swatches when colors provided", () => {
    render(
      <ProductCard
        product={{ ...baseProduct, colors: ["#ff0000", "#00ff00"], colorLabel: "ROJO" }}
      />
    );
    expect(screen.getByLabelText("Colores disponibles")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^#/)).toHaveLength(2);
  });

  it("does not render color swatches when colors not provided", () => {
    render(<ProductCard product={baseProduct} />);
    expect(screen.queryByLabelText("Colores disponibles")).not.toBeInTheDocument();
  });
});
