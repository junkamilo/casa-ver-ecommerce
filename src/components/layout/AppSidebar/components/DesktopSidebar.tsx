import Link from "next/link";
import Image from "next/image";
import { Store, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import type { DesktopSidebarProps } from "../types";
import { NavItem } from "./NavItem";

export function DesktopSidebar({
  isOpen,
  onToggle,
  navItems,
  brandSubtitle,
  userName,
  userInitial,
  userRole,
  backLink,
  extraLink,
}: DesktopSidebarProps) {
  return (
    <aside
      className={`hidden md:flex flex-col bg-[#154734] text-white shadow-xl z-20 transition-all duration-300 ease-in-out relative ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-[5.5rem] w-6 h-6 rounded-full bg-[#154734] border-2 border-white/20 hover:border-[#C19A6B] flex items-center justify-center text-white/60 hover:text-white transition-all z-10 shadow-md"
        aria-label={isOpen ? "Colapsar menú" : "Expandir menú"}
      >
        {isOpen ? (
          <ChevronLeft className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>

      {/* Logo */}
      <div
        className={`border-b border-white/10 flex items-center transition-all duration-300 ${
          isOpen ? "p-5 gap-3" : "p-3 justify-center"
        }`}
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-[#C19A6B]/60 shadow-md">
          <Image src={logoIcon} alt="Casa Verde" fill className="object-cover" priority />
        </div>
        {isOpen && (
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span
              className="text-base font-bold text-white leading-none tracking-wide whitespace-nowrap"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Casa Verde
            </span>
            <span className="text-[10px] font-bold tracking-widest text-[#C19A6B] uppercase mt-1">
              {brandSubtitle}
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav
        className={`flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden transition-all duration-300 scrollbar-sidebar ${
          isOpen ? "px-3" : "px-2"
        }`}
      >
        {navItems.map((item) => (
          <NavItem key={item.id} item={item} collapsed={!isOpen} />
        ))}
      </nav>

      {/* Footer */}
      <div
        className={`border-t border-white/10 bg-[#0f3626]/50 transition-all duration-300 ${
          isOpen ? "p-4 space-y-3" : "p-2 flex flex-col items-center gap-2"
        }`}
      >
        {isOpen ? (
          <>
            <div className="flex items-center gap-3 px-1">
              <div className="w-9 h-9 rounded-full bg-[#C19A6B] flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm ring-2 ring-[#C19A6B]/30">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{userName}</p>
                <p className="text-xs text-white/50">{userRole}</p>
              </div>
            </div>
            {extraLink && (
              <Link
                href={extraLink.href}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#C19A6B]/20 hover:bg-[#C19A6B]/30 border border-[#C19A6B]/30 hover:border-[#C19A6B]/50 rounded-lg text-xs font-medium text-[#C19A6B] transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                {extraLink.label}
              </Link>
            )}
            <Link
              href={backLink.href}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-lg text-xs font-medium text-white/80 hover:text-white transition-all"
            >
              <Store className="w-4 h-4" />
              {backLink.label}
            </Link>
          </>
        ) : (
          <>
            <div
              title={userName ?? ""}
              className="w-8 h-8 rounded-full bg-[#C19A6B] flex items-center justify-center font-bold text-white text-xs ring-2 ring-[#C19A6B]/30"
            >
              {userInitial}
            </div>
            <Link
              href={backLink.href}
              title={backLink.label}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
            >
              <Store className="w-4 h-4" />
            </Link>
          </>
        )}
      </div>

    </aside>
  );
}
