"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import SearchModal from "@/components/SearchModal";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/context/CartContext";
import logoIcon from "@/assets/logo-icon.png";

import { BRAND_GREEN } from "./constants/constants";
import MegaMenu from "./components/MegaMenu";
import MobileMenu from "./components/MobileMenu";
import NavActions from "./components/NavActions";
import NavLinks from "./components/NavLinks";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCategoriesHovered, setIsCategoriesHovered] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { cartCount, openCart } = useCart();
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  // ── Scroll listener: el header gana elevación y borde dorado al bajar ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openSearch = () => {
    setMenuOpen(false);
    setIsSearchModalOpen(true);
  };

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

          {/* ── Centro: "CASA VERDE" con shimmer dorado ── */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="block group" aria-label="Casa Verde — inicio">
              <span
                className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide animate-text-shimmer inline-block transition-transform duration-300 group-hover:scale-[1.03]"
                style={{
                  fontFamily: "Georgia, serif",
                  /* El 90% es verde puro, el 10% es el destello dorado */
                  backgroundImage: `linear-gradient(90deg, ${BRAND_GREEN} 0%, ${BRAND_GREEN} 42%, #C19A6B 47%, #F5E8D0 50%, #C19A6B 53%, ${BRAND_GREEN} 58%, ${BRAND_GREEN} 100%)`,
                  backgroundSize: "320% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
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
          onEnter={() => setIsCategoriesHovered(true)}
          onLeave={() => setIsCategoriesHovered(false)}
          onClose={() => setIsCategoriesHovered(false)}
        />

        {menuOpen && (
          <MobileMenu
            isAdmin={isAdmin}
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

export default Header;
