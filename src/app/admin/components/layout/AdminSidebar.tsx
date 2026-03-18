"use client";

import Link from "next/link";
import Image from "next/image";
import { Store, X, ChevronLeft, ChevronRight } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { ADMIN_NAV } from "../../constants";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  userName: string | null | undefined;
  userInitial: string;
}

export default function AdminSidebar({
  isOpen,
  onClose,
  pathname,
  userName,
  userInitial,
}: Props) {
  /* ── helpers ── */
  const isActive = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(href + "/");

  /* ── MOBILE OVERLAY (< md) ── */
  const MobileDrawer = (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* panel */}
      <aside className="relative w-72 max-w-[85vw] bg-[#154734] flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-300">
        {/* header */}
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
              Admin Panel
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  active
                    ? "bg-white text-[#154734] shadow-sm"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#C19A6B] rounded-r-full" />
                )}
                <item.icon
                  className={`w-5 h-5 shrink-0 ${
                    active ? "text-[#154734]" : "text-white/60 group-hover:text-white"
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* footer */}
        <div className="p-4 border-t border-white/10 bg-[#0f3626]/50 space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-[#C19A6B] flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-sm ring-2 ring-[#C19A6B]/30">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-white/50">Administrador</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-[#C19A6B]/20 border border-white/10 hover:border-[#C19A6B]/40 rounded-lg text-xs font-medium text-white transition-all"
          >
            <Store className="w-4 h-4" />
            Ir a la Tienda
          </Link>
        </div>
      </aside>
    </div>
  );

  /* ── DESKTOP SIDEBAR (≥ md) ── */
  const DesktopSidebar = (
    <aside
      className={`hidden md:flex flex-col bg-[#154734] text-white shadow-xl z-20 transition-all duration-300 ease-in-out relative ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      {/* collapse toggle */}
      <button
        onClick={onClose}
        className="absolute -right-3 top-[5.5rem] w-6 h-6 rounded-full bg-[#154734] border-2 border-white/20 hover:border-[#C19A6B] flex items-center justify-center text-white/60 hover:text-white transition-all z-10 shadow-md"
        aria-label={isOpen ? "Colapsar menú" : "Expandir menú"}
      >
        {isOpen ? (
          <ChevronLeft className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>

      {/* logo */}
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
              Admin Panel
            </span>
          </div>
        )}
      </div>

      {/* nav */}
      <nav
        className={`flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden transition-all duration-300 ${
          isOpen ? "px-3" : "px-2"
        }`}
      >
        {ADMIN_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!isOpen ? item.label : undefined}
              className={`relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden ${
                isOpen ? "px-4 py-3" : "justify-center p-3"
              } ${
                active
                  ? "bg-white text-[#154734] shadow-sm"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {active && isOpen && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#C19A6B] rounded-r-full" />
              )}
              <item.icon
                className={`w-5 h-5 shrink-0 ${
                  active ? "text-[#154734]" : "text-white/60 group-hover:text-white"
                }`}
              />
              {isOpen && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* footer */}
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
                <p className="text-xs text-white/50">Administrador</p>
              </div>
            </div>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-[#C19A6B]/20 border border-white/10 hover:border-[#C19A6B]/40 rounded-lg text-xs font-medium text-white transition-all"
            >
              <Store className="w-4 h-4" />
              Ir a la Tienda
            </Link>
          </>
        ) : (
          <>
            <div
              title={userName ?? "Admin"}
              className="w-8 h-8 rounded-full bg-[#C19A6B] flex items-center justify-center font-bold text-white text-xs ring-2 ring-[#C19A6B]/30"
            >
              {userInitial}
            </div>
            <Link
              href="/"
              title="Ir a la Tienda"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
            >
              <Store className="w-4 h-4" />
            </Link>
          </>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {isOpen && MobileDrawer}
      {DesktopSidebar}
    </>
  );
}
