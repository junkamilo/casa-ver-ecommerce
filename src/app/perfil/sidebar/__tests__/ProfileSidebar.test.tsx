import { render, screen, fireEvent } from "@testing-library/react";
import { ProfileSidebar } from "../components/ProfileSidebar";
import { SidebarUser } from "../types";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const mockUser: SidebarUser = {
  name: "Carlos López",
  email: "carlos@example.com",
  image: null,
  role: "USER",
};

describe("ProfileSidebar", () => {
  it("renderiza el item 'Mi Perfil'", () => {
    render(
      <ProfileSidebar user={mockUser} activeSection="perfil" onSectionChange={jest.fn()} />
    );
    expect(screen.getAllByText("Mi Perfil").length).toBeGreaterThan(0);
  });

  it("renderiza el item 'Mis Pedidos'", () => {
    render(
      <ProfileSidebar user={mockUser} activeSection="perfil" onSectionChange={jest.fn()} />
    );
    expect(screen.getAllByText("Mis Pedidos").length).toBeGreaterThan(0);
  });

  it("renderiza el nombre del usuario", () => {
    render(
      <ProfileSidebar user={mockUser} activeSection="perfil" onSectionChange={jest.fn()} />
    );
    expect(screen.getAllByText("Carlos López").length).toBeGreaterThan(0);
  });

  it("llama onSectionChange con 'pedidos' al hacer click en Mis Pedidos", () => {
    const onSectionChange = jest.fn();
    render(
      <ProfileSidebar user={mockUser} activeSection="perfil" onSectionChange={onSectionChange} />
    );

    const buttons = screen.getAllByText("Mis Pedidos");
    fireEvent.click(buttons[0]);
    expect(onSectionChange).toHaveBeenCalledWith("pedidos");
  });

  it("llama onSectionChange con 'perfil' al hacer click en Mi Perfil", () => {
    const onSectionChange = jest.fn();
    render(
      <ProfileSidebar user={mockUser} activeSection="pedidos" onSectionChange={onSectionChange} />
    );

    const buttons = screen.getAllByText("Mi Perfil");
    fireEvent.click(buttons[0]);
    expect(onSectionChange).toHaveBeenCalledWith("perfil");
  });

  it("muestra el link Volver a la tienda", () => {
    render(
      <ProfileSidebar user={mockUser} activeSection="perfil" onSectionChange={jest.fn()} />
    );
    expect(screen.getAllByText("Volver a la tienda").length).toBeGreaterThan(0);
  });

  it("no muestra el link de Admin cuando isAdmin es false", () => {
    render(
      <ProfileSidebar
        user={mockUser}
        activeSection="perfil"
        onSectionChange={jest.fn()}
        isAdmin={false}
      />
    );
    expect(screen.queryByText("Panel Admin")).not.toBeInTheDocument();
  });

  it("muestra el link de Admin cuando isAdmin es true", () => {
    render(
      <ProfileSidebar
        user={mockUser}
        activeSection="perfil"
        onSectionChange={jest.fn()}
        isAdmin={true}
      />
    );
    expect(screen.getByText("Panel Admin")).toBeInTheDocument();
  });

  it("el link de Admin apunta a /admin", () => {
    render(
      <ProfileSidebar
        user={mockUser}
        activeSection="perfil"
        onSectionChange={jest.fn()}
        isAdmin={true}
      />
    );
    const adminLink = screen.getByText("Panel Admin").closest("a");
    expect(adminLink).toHaveAttribute("href", "/admin");
  });
});
