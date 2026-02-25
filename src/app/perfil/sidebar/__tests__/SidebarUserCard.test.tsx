import { render, screen } from "@testing-library/react";
import { SidebarUserCard } from "../components/SidebarUserCard";
import { SidebarUser } from "../types";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

const baseUser: SidebarUser = {
  name: "Ana García",
  email: "ana@example.com",
  image: null,
  role: "USER",
};

describe("SidebarUserCard", () => {
  it("muestra el nombre del usuario", () => {
    render(<SidebarUserCard user={baseUser} />);
    expect(screen.getByText("Ana García")).toBeInTheDocument();
  });

  it("muestra el email del usuario", () => {
    render(<SidebarUserCard user={baseUser} />);
    expect(screen.getByText("ana@example.com")).toBeInTheDocument();
  });

  it("muestra 'Cliente' para rol USER", () => {
    render(<SidebarUserCard user={baseUser} />);
    expect(screen.getByText("Cliente")).toBeInTheDocument();
  });

  it("muestra 'Administrador' para rol ADMIN", () => {
    render(<SidebarUserCard user={{ ...baseUser, role: "ADMIN" }} />);
    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });

  it("muestra la inicial del nombre cuando no hay imagen", () => {
    render(<SidebarUserCard user={baseUser} />);
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("muestra 'U' como fallback cuando no hay nombre ni imagen", () => {
    render(<SidebarUserCard user={{ ...baseUser, name: null }} />);
    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("muestra 'Usuario' como nombre fallback cuando name es null", () => {
    render(<SidebarUserCard user={{ ...baseUser, name: null }} />);
    expect(screen.getByText("Usuario")).toBeInTheDocument();
  });

  it("renderiza imagen cuando image tiene valor", () => {
    render(<SidebarUserCard user={{ ...baseUser, image: "/avatar.jpg" }} />);
    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "Ana García");
  });

  it("no renderiza imagen cuando image es null", () => {
    render(<SidebarUserCard user={baseUser} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
