import Link from "next/link";
import type { NavItemProps } from "../types";
import { NavItemContent } from "./NavItemContent";
import { NavGroup } from "./NavGroup";

export function NavItem({ item, collapsed }: NavItemProps) {
  if (item.children?.length) {
    return <NavGroup item={item} collapsed={collapsed} />;
  }

  const baseClass = `relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden ${
    collapsed ? "justify-center p-3" : "px-4 py-3"
  } ${
    item.isActive
      ? "bg-white text-[#154734] shadow-sm"
      : "text-white/75 hover:bg-white/10 hover:text-white"
  }`;

  if (item.href) {
    return (
      <Link
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={baseClass}
      >
        <NavItemContent item={item} collapsed={collapsed} />
      </Link>
    );
  }

  return (
    <button
      onClick={item.onClick}
      title={collapsed ? item.label : undefined}
      className={`w-full ${baseClass}`}
    >
      <NavItemContent item={item} collapsed={collapsed} />
    </button>
  );
}
