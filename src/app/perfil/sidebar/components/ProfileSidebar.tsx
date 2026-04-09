"use client";

import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { ProfileSidebarProps, NavItem } from "../types";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarUserCard } from "./SidebarUserCard";
import { PERFIL_NAV } from "../../constants";

export function ProfileSidebar({ user, activeSection, onSectionChange, isAdmin = false }: ProfileSidebarProps) {
  return (
    <aside className="flex flex-col h-full bg-linear-to-b from-[#154734] to-[#103a2a] text-white">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-white/10">
        <p className="text-xs font-medium text-white/50 uppercase tracking-widest mb-1">
          Casa Verde
        </p>
        <p className="text-sm font-semibold text-white/80">Mi Cuenta</p>
      </div>

      {/* User card */}
      <div className="px-3 py-3">
        <SidebarUserCard user={user} />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {(PERFIL_NAV as NavItem[]).map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            isActive={activeSection === item.id}
            onClick={() => onSectionChange(item.id)}
          />
        ))}
      </nav>

      {/* Footer links */}
      <div className="px-4 py-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a la tienda
        </Link>
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-2 text-sm text-[#C19A6B] hover:text-[#d4b080] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Panel Admin
          </Link>
        )}
      </div>
    </aside>
  );
}
