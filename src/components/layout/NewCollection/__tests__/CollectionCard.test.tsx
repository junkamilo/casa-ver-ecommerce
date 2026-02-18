import { render, screen } from "@testing-library/react";
import CollectionCard from "../components/CollectionCard";
import { CollectionItem } from "../types/types";

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

const baseItem: CollectionItem = {
  image: { src: "/new-1.jpg", height: 400, width: 300 },
  name: "SET PANT BUSO LÍNEAS",
  price: "$170.000",
  slug: "set-pant-buso",
};

describe("CollectionCard", () => {
  it("renders item name", () => {
    render(<CollectionCard item={baseItem} />);
    expect(screen.getByText("SET PANT BUSO LÍNEAS")).toBeInTheDocument();
  });

  it("renders item price", () => {
    render(<CollectionCard item={baseItem} />);
    expect(screen.getByText("$170.000")).toBeInTheDocument();
  });

  it("links to the correct product URL", () => {
    render(<CollectionCard item={baseItem} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/product/set-pant-buso");
  });

  it("renders badge when provided", () => {
    render(<CollectionCard item={{ ...baseItem, badge: "Oferta" }} />);
    expect(screen.getByText("Oferta")).toBeInTheDocument();
  });

  it("does not render badge when not provided", () => {
    render(<CollectionCard item={baseItem} />);
    expect(screen.queryByText("Oferta")).not.toBeInTheDocument();
  });

  it("renders oldPrice with line-through when provided", () => {
    render(<CollectionCard item={{ ...baseItem, oldPrice: "$60.000" }} />);
    const oldPrice = screen.getByText("$60.000");
    expect(oldPrice).toBeInTheDocument();
    expect(oldPrice.className).toContain("line-through");
  });

  it("does not render oldPrice when not provided", () => {
    render(<CollectionCard item={baseItem} />);
    expect(screen.queryByText(/line-through/)).not.toBeInTheDocument();
  });

  it("renders color swatches when colors provided", () => {
    render(
      <CollectionCard
        item={{ ...baseItem, colors: ["#ff0000", "#00ff00"], colorLabel: "ROJO" }}
      />
    );
    expect(screen.getByLabelText("Colores disponibles")).toBeInTheDocument();
    expect(screen.getAllByLabelText(/^#/)).toHaveLength(2);
  });

  it("does not render color swatches when colors not provided", () => {
    render(<CollectionCard item={baseItem} />);
    expect(screen.queryByLabelText("Colores disponibles")).not.toBeInTheDocument();
  });
});
