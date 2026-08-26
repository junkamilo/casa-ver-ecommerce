import type { AdminNavItem } from "../types";
import type { AppSidebarNavItem } from "@/components/layout/AppSidebar/types";

function isPathActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isGroupActive(pathname: string, item: AdminNavItem): boolean {
  if (item.href && isPathActive(pathname, item.href)) return true;
  return item.children?.some((child) => child.href && isPathActive(pathname, child.href)) ?? false;
}

export function buildAdminSidebarNav(
  items: AdminNavItem[],
  pathname: string
): AppSidebarNavItem[] {
  return items.flatMap((item) => {
    if (item.children?.length) {
      const groupActive = isGroupActive(pathname, item);
      const parentHref = item.href ?? item.children[0]?.href;

      const group: AppSidebarNavItem = {
        id: parentHref ?? item.label,
        label: item.label,
        icon: item.icon,
        isActive: groupActive,
        href: parentHref,
        children: item.children.map((child) => ({
          id: child.href!,
          label: child.label,
          icon: child.icon,
          isActive: child.href ? isPathActive(pathname, child.href) : false,
          href: child.href,
        })),
      };

      return [group];
    }

    if (!item.href) return [];

    return [
      {
        id: item.href,
        label: item.label,
        icon: item.icon,
        isActive: isPathActive(pathname, item.href),
        href: item.href,
      },
    ];
  });
}

export function getAdminPageLabel(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.includes("/configuraciones/precio-envios")) return "Precio envíos";
  if (pathname.includes("/configuraciones/ciudades-envios")) return "Ciudades de envío";
  if (pathname.startsWith("/admin/configuraciones")) return "Configuraciones";
  const segment = pathname.split("/").pop() ?? "Panel";
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
}
