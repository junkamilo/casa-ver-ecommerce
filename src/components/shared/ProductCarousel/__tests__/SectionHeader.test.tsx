import { render, screen } from "@testing-library/react";
import SectionHeader from "../components/SectionHeader";
import { SectionConfig } from "../types";

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

const baseConfig: SectionConfig = {
  eyebrow: "Descubre",
  titleStart: "Los Más",
  titleItalic: "Deseados",
  linkHref: "/collections/mas-vendidos",
  linkText: "VER COLECCIÓN",
  bgColor: "bg-[#FAFAFA]",
  decorNumber: "02",
  decorAlign: "right",
  badgeVariant: "white",
};

describe("SectionHeader", () => {
  it("renders eyebrow text", () => {
    render(<SectionHeader config={baseConfig} />);
    expect(screen.getByText("Descubre")).toBeInTheDocument();
  });

  it("renders title start text", () => {
    render(<SectionHeader config={baseConfig} />);
    expect(screen.getByText(/Los Más/)).toBeInTheDocument();
  });

  it("renders italic title text", () => {
    render(<SectionHeader config={baseConfig} />);
    expect(screen.getByText("Deseados")).toBeInTheDocument();
  });

  it("renders link with correct href and text", () => {
    render(<SectionHeader config={baseConfig} />);
    const link = screen.getByRole("link", { name: /VER COLECCIÓN/i });
    expect(link).toHaveAttribute("href", "/collections/mas-vendidos");
  });

  it("renders with different config (NewCollection style)", () => {
    const newCollectionConfig: SectionConfig = {
      eyebrow: "Lanzamientos",
      titleStart: "Nueva",
      titleItalic: "Colección",
      linkHref: "/collections/nueva-coleccion",
      linkText: "VER TODO",
      bgColor: "bg-white",
      decorNumber: "03",
      decorAlign: "left",
    };
    render(<SectionHeader config={newCollectionConfig} />);
    expect(screen.getByText("Lanzamientos")).toBeInTheDocument();
    expect(screen.getByText("Colección")).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /VER TODO/i });
    expect(link).toHaveAttribute("href", "/collections/nueva-coleccion");
  });
});
