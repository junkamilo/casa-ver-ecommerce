"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { NavItemProps } from "../types";
import { NavItemContent } from "./NavItemContent";

export function NavGroup({ item, collapsed }: NavItemProps) {
  const hasActiveChild = item.children?.some((child) => child.isActive) ?? false;
  const [open, setOpen] = useState(item.isActive || hasActiveChild);

  const parentClass = `relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden w-full ${
    collapsed ? "justify-center p-3" : "px-4 py-3"
  } ${
    item.isActive
      ? "bg-white/10 text-white"
      : "text-white/75 hover:bg-white/10 hover:text-white"
  }`;

  if (collapsed) {
    return (
      <Link
        href={item.href ?? item.children?.[0]?.href ?? "#"}
        title={item.label}
        className={`${parentClass} ${
          item.isActive ? "ring-2 ring-white/30 bg-white/15" : ""
        }`}
      >
        <NavItemContent item={item} collapsed={collapsed} />
      </Link>
    );
  }

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={parentClass}
        aria-expanded={open}
      >
        <NavItemContent item={item} collapsed={collapsed} />
        <ChevronDown
          className={`ml-auto w-4 h-4 shrink-0 text-white/50 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && item.children && (
        <div className="ml-3 pl-3 border-l border-white/15 space-y-0.5">
          {item.children.map((child) => {
            const childClass = `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
              child.isActive
                ? "bg-white text-[#154734] shadow-sm"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`;
            return (
              <Link key={child.id} href={child.href ?? "#"} className={childClass}>
                <child.icon className="w-3.5 h-3.5 shrink-0" />
                <span>{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
