"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import SearchModal from "@/components/SearchModal";
import CartDrawer from "@/components/CartDrawer";
import logoIcon from "@/assets/logo-icon.png";

import { BRAND_GREEN } from "../constants/constants";
import { useHeaderClient } from "../hooks/useHeaderClient";
import MegaMenu from "./MegaMenu";
import MobileMenu from "./MobileMenu";
import NavActions from "./NavActions";
import NavLinks from "./NavLinks";
import type { HeaderClientProps } from "../types";

const HeaderClient = ({ categories }: HeaderClientProps) => {
  const {
    menuOpen,
    isCategoriesHovered,
    isSearchModalOpen,
    isUserMenuOpen,
    scrolled,
    isAdmin,
    cartCount,
    openCart,
    openSearch,
    setMenuOpen,
    setIsCategoriesHovered,
    setIsUserMenuOpen,
    setIsSearchModalOpen,
  } = useHeaderClient();

  return (
    <>
      <header
        className={`w-full sticky top-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? "bg-background/98 backdrop-blur-xl shadow-premium-lg"
            : "bg-background/88 backdrop-blur-md shadow-sm"
        }`}
        onMouseLeave={() => setIsCategoriesHovered(false)}
      >
        {/* ── Línea dorada inferior: aparece suavemente al hacer scroll ── */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#C19A6B] to-transparent animate-border-shimmer transition-opacity duration-500 ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* ══ CONTENIDO PRINCIPAL ══ */}
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 relative z-50">

          {/* ── Izquierda: hamburguesa + logo + nav ── */}
          <div className="flex items-center gap-4 lg:gap-8">

            {/* Botón hamburguesa con círculo de hover */}
            <button
              className="lg:hidden text-foreground hover:text-[#154734] transition-colors relative group"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
            >
              <span
                className="absolute inset-0 -m-2 rounded-full bg-[#154734]/0 group-hover:bg-[#154734]/8 transition-all duration-300 scale-0 group-hover:scale-100"
                aria-hidden="true"
              />
              {menuOpen
                ? <X className="relative w-6 h-6" />
                : <Menu className="relative w-6 h-6" />
              }
            </button>

            {/* Logo con halo dorado en hover */}
            <Link href="/" className="shrink-0 block group relative" aria-label="Inicio">
              <span
                className="absolute inset-0 -m-1.5 rounded-full blur-md bg-[#C19A6B]/0 group-hover:bg-[#C19A6B]/25 transition-all duration-500"
                aria-hidden="true"
              />
              <Image
                src={logoIcon}
                alt="Casa Verde"
                className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover transition-all duration-400 group-hover:scale-105 shadow-sm group-hover:shadow-[0_0_14px_rgba(193,154,107,0.4)]"
                priority
              />
            </Link>

            <NavLinks
              isCategoriesActive={isCategoriesHovered}
              onCategoriesEnter={() => setIsCategoriesHovered(true)}
            />
          </div>

          {/* ── Centro: "CASA VERDE" — Solo visible en desktop (lg+), oculto en móvil/tablet ── */}
          <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 pointer-events-none">
            <Link href="/" className="block pointer-events-auto" aria-label="Casa Verde — inicio">
              <span
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-wide text-[#154734] inline-block"
                style={{ fontFamily: "Georgia, serif" }}
              >
                CASA VERDE
              </span>
            </Link>
          </div>

          {/* ── Derecha: íconos de acción ── */}
          <NavActions
            isAdmin={isAdmin}
            cartCount={cartCount}
            isUserMenuOpen={isUserMenuOpen}
            onSearchOpen={openSearch}
            onCartOpen={openCart}
            onUserMenuToggle={() => setIsUserMenuOpen(!isUserMenuOpen)}
            onUserMenuClose={() => setIsUserMenuOpen(false)}
          />
        </div>

        <MegaMenu
          visible={isCategoriesHovered}
          categories={categories}
          onEnter={() => setIsCategoriesHovered(true)}
          onLeave={() => setIsCategoriesHovered(false)}
          onClose={() => setIsCategoriesHovered(false)}
        />

        {menuOpen && (
          <MobileMenu
            isAdmin={isAdmin}
            categories={categories}
            onClose={() => setMenuOpen(false)}
            onSearchOpen={openSearch}
          />
        )}
      </header>

      {isSearchModalOpen && (
        <SearchModal onClose={() => setIsSearchModalOpen(false)} />
      )}

      <CartDrawer />
    </>
  );
};

export default HeaderClient;
