"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, User, Shield, ChevronRight, ChevronDown } from "lucide-react";
import { HOVER_BRAND, TEXT_BRAND } from "../constants/constants";
import type { MobileMenuProps } from "../types";

export default function MobileMenu({ isAdmin, categories, onClose, onSearchOpen }: MobileMenuProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTipo = searchParams.get("tipo");

  // Nivel 1: sección CATEGORÍAS abierta/cerrada
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  // Nivel 2: qué categoría tiene sus tipos de prenda abiertos (una a la vez)
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  const toggleCategory = (id: string) => {
    setOpenCategoryId((prev) => (prev === id ? null : id));
  };

  return (
    <nav
      className="lg:hidden absolute top-full left-0 w-full border-b border-border/40 z-50 shadow-premium-lg h-[calc(100vh-64px)] overflow-y-auto animate-menu-slide"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,1) 60%)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* ── Franja decorativa dorada ── */}
      <div className="h-px bg-linear-to-r from-transparent via-[#C19A6B]/60 to-transparent animate-border-shimmer" />

      {/* ── Aurora sutil de fondo ── */}
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 100% at 50% 0%, #154734 0%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col px-6 py-6 gap-1">

        {/* ── BUSCAR ── */}
        <button
          className="group flex items-center gap-3 text-sm font-bold tracking-[0.15em] text-foreground hover:text-[#154734] py-3.5 border-b border-border/40 text-left transition-colors duration-200 w-full mb-2"
          onClick={onSearchOpen}
        >
          <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#154734]/0 group-hover:bg-[#154734]/8 transition-colors duration-300">
            <Search className="w-4 h-4" />
          </span>
          BUSCAR
          <ChevronRight className="ml-auto w-4 h-4 text-foreground/30 group-hover:text-[#154734]/50 transition-colors" />
        </button>

        {/* ── INICIO ── */}
        <Link
          href="/"
          className="group flex items-center gap-3 text-sm font-bold tracking-[0.15em] text-foreground hover:text-[#154734] py-3 transition-colors duration-200"
          onClick={onClose}
        >
          <span className="w-1.5 h-1.5 rotate-45 bg-[#C19A6B]/0 group-hover:bg-[#C19A6B] transition-all duration-300 shrink-0" aria-hidden="true" />
          INICIO
        </Link>

        {/* ── TIENDA ── */}
        <Link
          href="/tienda"
          className="group flex items-center gap-3 text-sm font-bold tracking-[0.15em] text-foreground hover:text-[#154734] py-3 transition-colors duration-200"
          onClick={onClose}
        >
          <span className="w-1.5 h-1.5 rotate-45 bg-[#C19A6B]/0 group-hover:bg-[#C19A6B] transition-all duration-300 shrink-0" aria-hidden="true" />
          TIENDA
        </Link>


        {/* ── CATEGORÍAS (acordeón nivel 1) ── */}
        <div className="flex flex-col">

          {/* Botón toggle de CATEGORÍAS */}
          <button
            className="group flex items-center gap-3 text-sm font-bold tracking-[0.15em] text-foreground hover:text-[#154734] py-3 transition-colors duration-200 w-full text-left"
            onClick={() => setCategoriesOpen((v) => !v)}
            aria-expanded={categoriesOpen}
          >
            <span
              className={`w-1.5 h-1.5 rotate-45 transition-all duration-300 shrink-0 ${
                categoriesOpen ? "bg-[#C19A6B]" : "bg-[#C19A6B]/0 group-hover:bg-[#C19A6B]"
              }`}
              aria-hidden="true"
            />
            CATEGORÍAS
            <ChevronDown
              className={`ml-auto w-4 h-4 text-foreground/40 transition-all duration-300 ${
                categoriesOpen ? "rotate-180 text-[#154734]" : "group-hover:text-[#154734]/50"
              }`}
            />
          </button>

          {/* Panel de categorías — desliza hacia abajo */}
          <div
            className={`overflow-hidden transition-all duration-350 ease-out ${
              categoriesOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="flex flex-col gap-1 pb-2 pt-1">

              {/* Separador dorado */}
              <div className="flex items-center gap-2 mb-2 px-3">
                <div className="h-px flex-1 bg-linear-to-r from-[#C19A6B]/40 to-transparent" />
              </div>

              {categories.length === 0 && (
                <p className="italic text-sm text-gray-400 pl-4 py-2">
                  Pronto agregaremos nuevas categorías.
                </p>
              )}

              {categories.map((category) => {
                const isOpen = openCategoryId === category.id;
                const hasTypes = category.garmentTypes.length > 0;

                return (
                  <div key={category.id} className="flex flex-col">

                    {/* Fila de categoría: toggle si tiene tipos, link directo si no */}
                    {hasTypes ? (
                      <button
                        className="group flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-[#154734]/5 transition-colors duration-200 w-full text-left"
                        onClick={() => toggleCategory(category.id)}
                        aria-expanded={isOpen}
                      >
                        <span
                          className={`w-1 h-1 rounded-full shrink-0 transition-all duration-300 ${
                            isOpen ? "bg-[#C19A6B] scale-125" : "bg-[#154734]/30 group-hover:bg-[#154734]"
                          }`}
                          aria-hidden="true"
                        />
                        <span
                          className={`text-xs font-bold uppercase tracking-[0.2em] transition-colors duration-200 ${
                            isOpen ? "text-[#154734]" : "text-foreground/70 group-hover:text-[#154734]"
                          }`}
                        >
                          {category.name}
                        </span>
                        <ChevronDown
                          className={`ml-auto w-3.5 h-3.5 transition-all duration-300 ${
                            isOpen
                              ? "rotate-180 text-[#C19A6B]"
                              : "text-foreground/30 group-hover:text-[#154734]/50"
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        href={`/collections/${category.slug}`}
                        className="group flex items-center gap-3 py-3 px-3 rounded-lg hover:bg-[#154734]/5 transition-colors duration-200"
                        onClick={onClose}
                      >
                        <span className="w-1 h-1 rounded-full bg-[#154734]/30 group-hover:bg-[#154734] shrink-0 transition-colors duration-200" aria-hidden="true" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/70 group-hover:text-[#154734] transition-colors duration-200">
                          {category.name}
                        </span>
                        <ChevronRight className="ml-auto w-3.5 h-3.5 text-foreground/30 group-hover:text-[#154734]/50 transition-colors" />
                      </Link>
                    )}

                    {/* Tipos de prenda — desliza bajo la categoría */}
                    {hasTypes && (
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-out ${
                          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 pl-6 pr-3 pb-2">

                          {/* Link "Ver todo" la colección */}
                          <Link
                            href={`/collections/${category.slug}`}
                            className="flex items-center gap-2 py-2.5 text-xs text-[#154734]/70 font-medium hover:text-[#154734] transition-colors duration-200 border-b border-border/30 mb-1"
                            onClick={onClose}
                          >
                            <span className="w-3 h-px bg-[#C19A6B]/50" aria-hidden="true" />
                            Ver toda la colección
                          </Link>

                          {category.garmentTypes.map((gt) => {
                            const isGarmentActive =
                              pathname === `/collections/${category.slug}` &&
                              activeTipo === gt.slug;
                            return (
                              <Link
                                key={gt.id}
                                href={`/collections/${category.slug}?tipo=${gt.slug}`}
                                className={`relative group flex items-center gap-2 py-2.5 pl-2 text-sm transition-colors duration-200 rounded-md ${
                                  isGarmentActive
                                    ? "text-[#C19A6B] font-medium bg-[#C19A6B]/5"
                                    : "text-gray-500 hover:text-[#154734] hover:bg-[#154734]/5"
                                }`}
                                onClick={onClose}
                              >
                                <span
                                  className={`w-1 h-1 rounded-full shrink-0 transition-all duration-200 ${
                                    isGarmentActive ? "bg-[#C19A6B]" : "bg-gray-300 group-hover:bg-[#154734]"
                                  }`}
                                  aria-hidden="true"
                                />
                                <span
                                  className={`transition-transform duration-200 ${
                                    isGarmentActive ? "underline underline-offset-2 decoration-[#C19A6B]/50 decoration-1" : ""
                                  }`}
                                >
                                  {gt.name}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── PANEL ADMIN ── */}
        {isAdmin && (
          <div className="flex flex-col gap-3 pt-5 mt-3 border-t border-border/40">
            <div className="flex items-center gap-3">
              <Shield className="w-3.5 h-3.5 text-[#C19A6B]" />
              <span className="text-[10px] font-bold text-[#C19A6B] uppercase tracking-[0.25em]">
                PANEL ADMIN
              </span>
              <div className="h-px flex-1 bg-linear-to-r from-[#C19A6B]/30 to-transparent" />
            </div>
            {[
              { href: "/admin",               label: "Dashboard" },
              { href: "/admin/productos",      label: "Gestionar Productos" },
              { href: "/admin/pedidos",        label: "Ver Pedidos" },
              { href: "/admin/estadisticas",   label: "Estadísticas" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`relative group flex items-center gap-2 text-sm text-foreground/75 ${HOVER_BRAND} transition-all duration-200 pl-4 py-0.5`}
                onClick={onClose}
              >
                <span
                  className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-[#C19A6B] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top rounded-full"
                  aria-hidden="true"
                />
                <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* ── MI CUENTA ── */}
        <Link
          href="/cuenta"
          className="group flex items-center gap-3 text-sm font-bold tracking-[0.15em] text-foreground hover:text-[#154734] pt-5 mt-2 border-t border-border/40 transition-colors duration-200"
          onClick={onClose}
        >
          <span className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#154734]/0 group-hover:bg-[#154734]/8 transition-colors duration-300">
            <User className="w-4 h-4" />
          </span>
          MI CUENTA
          <ChevronRight className="ml-auto w-4 h-4 text-foreground/30 group-hover:text-[#154734]/50 transition-colors" />
        </Link>
      </div>

      {/* ── Franja dorada final ── */}
      <div className="h-px bg-linear-to-r from-transparent via-[#C19A6B]/20 to-transparent" />
    </nav>
  );
}
