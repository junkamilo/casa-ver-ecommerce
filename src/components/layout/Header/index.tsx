"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import SearchModal from "@/components/SearchModal";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/context/CartContext";
import logoIcon from "@/assets/logo-icon.png";

import { TEXT_BRAND, HOVER_BRAND, BRAND_GREEN } from "./constants";
import MegaMenu from "./components/MegaMenu";
import MobileMenu from "./components/MobileMenu";
import NavActions from "./components/NavActions";
import NavLinks from "./components/NavLinks";


const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCategoriesHovered, setIsCategoriesHovered] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { cartCount, openCart } = useCart();
  const { data: session } = useSession();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const openSearch = () => {
    setMenuOpen(false);
    setIsSearchModalOpen(true);
  };

  return (
    <>
      <header
        className="w-full bg-background relative sticky top-0 z-50 border-b border-border/40 shadow-sm"
        onMouseLeave={() => setIsCategoriesHovered(false)}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-background relative z-50">

          {/* Left: hamburger + logo + nav */}
          <div className="flex items-center gap-4 lg:gap-8">
            <button
              className={`lg:hidden text-foreground ${HOVER_BRAND} transition-colors`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="shrink-0 block group">
              <Image
                src={logoIcon}
                alt="Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover group-hover:opacity-80 transition-opacity shadow-sm"
                priority
              />
            </Link>

            <NavLinks
              isCategoriesActive={isCategoriesHovered}
              onCategoriesEnter={() => setIsCategoriesHovered(true)}
            />
          </div>

          {/* Center: brand name */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              className={`text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide ${TEXT_BRAND}`}
              style={{ fontFamily: "Georgia, serif", color: BRAND_GREEN }}
            >
              Casa Verde
            </Link>
          </div>

          {/* Right: icons */}
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
