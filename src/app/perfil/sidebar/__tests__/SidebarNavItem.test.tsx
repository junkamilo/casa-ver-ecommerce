import { render, screen, fireEvent } from "@testing-library/react";
import { User } from "lucide-react";
import { SidebarNavItem } from "../components/SidebarNavItem";
import { NavItem } from "../types";

const mockItem: NavItem = {
  id: "perfil",
  label: "Mi Perfil",
  description: "Información personal",
  icon: User,
};

describe("SidebarNavItem — modo desktop", () => {
  it("renderiza el label del item", () => {
    render(<SidebarNavItem item={mockItem} isActive={false} onClick={jest.fn()} />);
    expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
  });

  it("renderiza la descripción del item", () => {
    render(<SidebarNavItem item={mockItem} isActive={false} onClick={jest.fn()} />);
    expect(screen.getByText("Información personal")).toBeInTheDocument();
  });

  it("aplica estilos activos cuando isActive es true", () => {
    const { container } = render(
      <SidebarNavItem item={mockItem} isActive={true} onClick={jest.fn()} />
    );
    const button = container.firstChild as HTMLElement;
    expect(button.className).toContain("bg-[#154734]");
    expect(button.className).toContain("text-white");
  });

  it("no aplica estilos activos cuando isActive es false", () => {
    const { container } = render(
      <SidebarNavItem item={mockItem} isActive={false} onClick={jest.fn()} />
    );
    const button = container.firstChild as HTMLElement;
    expect(button.className).not.toContain("bg-[#154734]");
  });

  it("llama onClick al hacer click", () => {
    const onClick = jest.fn();
    render(<SidebarNavItem item={mockItem} isActive={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renderiza el ícono como SVG", () => {
    const { container } = render(
      <SidebarNavItem item={mockItem} isActive={false} onClick={jest.fn()} />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

describe("SidebarNavItem — modo mobile", () => {
  it("renderiza el label en modo mobile", () => {
    render(<SidebarNavItem item={mockItem} isActive={false} onClick={jest.fn()} mobile />);
    expect(screen.getByText("Mi Perfil")).toBeInTheDocument();
  });

  it("aplica borde inferior verde cuando está activo", () => {
    const { container } = render(
      <SidebarNavItem item={mockItem} isActive={true} onClick={jest.fn()} mobile />
    );
    const button = container.firstChild as HTMLElement;
    expect(button.className).toContain("border-[#154734]");
  });

  it("aplica borde transparente cuando está inactivo", () => {
    const { container } = render(
      <SidebarNavItem item={mockItem} isActive={false} onClick={jest.fn()} mobile />
    );
    const button = container.firstChild as HTMLElement;
    expect(button.className).toContain("border-transparent");
  });

  it("llama onClick en modo mobile", () => {
    const onClick = jest.fn();
    render(<SidebarNavItem item={mockItem} isActive={false} onClick={onClick} mobile />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("no muestra la descripción en modo mobile", () => {
    render(<SidebarNavItem item={mockItem} isActive={false} onClick={jest.fn()} mobile />);
    expect(screen.queryByText("Información personal")).not.toBeInTheDocument();
  });
});
