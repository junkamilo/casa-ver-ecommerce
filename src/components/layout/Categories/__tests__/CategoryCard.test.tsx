import { render, screen } from "@testing-library/react";
import CategoryCard from "../components/CategoryCard";
import { StaticImageData } from "next/image";

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

const mockImage: StaticImageData = { src: "/cat-test.jpg", height: 400, width: 300, blurDataURL: "" };

describe("CategoryCard", () => {
  it("renders the category label", () => {
    render(<CategoryCard image={mockImage} label="ENTERIZOS CORTOS" slug="enterizos-cortos" />);
    expect(screen.getByText("ENTERIZOS CORTOS")).toBeInTheDocument();
  });

  it("renders the image with correct alt text", () => {
    render(<CategoryCard image={mockImage} label="SETS" slug="sets" />);
    expect(screen.getByAltText("SETS")).toBeInTheDocument();
  });

  it("links to the correct /collections/slug URL", () => {
    render(<CategoryCard image={mockImage} label="CHAQUETAS" slug="chaquetas" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/collections/chaquetas");
  });

  it("each slug generates a unique URL", () => {
    const slugs = ["enterizos-cortos", "sets", "chaquetas", "enterizos-largos", "bodys"];
    slugs.forEach((slug) => {
      const { unmount } = render(
        <CategoryCard image={mockImage} label={slug.toUpperCase()} slug={slug} />
      );
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", `/collections/${slug}`);
      unmount();
    });
  });
});
