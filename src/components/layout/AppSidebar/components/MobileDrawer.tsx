import Link from "next/link";
import Image from "next/image";
import { X, ShieldCheck } from "lucide-react";
import { StoreIcon } from "@/components/icons";
import logoIcon from "@/assets/logo-icon.png";
import type { MobileDrawerProps } from "../types";
import { NavItem } from "./NavItem";

export function MobileDrawer({
  onToggle,
  navItems,
  brandSubtitle,
  userName,
  userInitial,
  userRole,
  backLink,
  extraLink,
}: MobileDrawerProps) {
  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onToggle}
      />
      <aside className="relative w-72 max-w-[85vw] bg-[#154734] flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-300">

        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-[#C19A6B]/60 shadow-md">
            <Image src={logoIcon} alt="Casa Verde" fill className="object-cover" priority />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span
              className="text-base font-bold text-white leading-none tracking-wide"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Casa Verde
            </span>
            <span className="text-[10px] font-bold tracking-widest text-[#C19A6B] uppercase mt-1">
              {brandSubtitle}
            </span>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.id} item={item} collapsed={false} />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0f3626]/50 space-y-3">
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
          {backLink && (
            <Link
              href={backLink.href}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-lg text-xs font-medium text-white/80 hover:text-white transition-all"
            >
              <StoreIcon size={16} />
              {backLink.label}
            </Link>
          )}
        </div>

      </aside>
    </div>
  );
}
