"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import SearchModal from "@/components/SearchModal";
import UserMenu from "@/components/UserMenu";
import CartDrawer from "@/components/CartDrawer"; // <--- 1. IMPORTAMOS EL CARRITO
import { useCart } from "@/context/CartContext";

const megaMenuData = [
  {
    title: "ENTERIZOS",
    items: [
      { name: "ENTERIZOS CORTOS", slug: "enterizos-cortos" },
      { name: "ENTERIZO LARGO", slug: "enterizo-largo" },
    ],
  },
  {
    title: "SETS",
    items: [
      { name: "SET SHORT", slug: "set-short" },
      { name: "SET PANT", slug: "set-pant" },
    ],
  },
  {
    title: "BODYS",
    items: [
      { name: "LÍNEA SPORT", slug: "linea-sport" },
      { name: "CHAQUETAS", slug: "chaquetas" },
      { name: "NYLON PREMIUM", slug: "nylon-premium" },
    ],
  },
  {
    title: "ACCESORIOS",
    items: [
      { name: "BALACAS", slug: "balacas" },
      { name: "BOLSOS", slug: "bolsos" },
      { name: "MEDIAS", slug: "medias" },
    ],
  },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCategoriesHovered, setIsCategoriesHovered] = useState(false);
  const { cartCount, openCart } = useCart();

  // ESTADOS DE LOS MODALES
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const openSearchModal = () => {
    setMenuOpen(false);
    setIsSearchModalOpen(true);
  };

  return (
    <>
      <header
        className="w-full bg-background relative sticky top-0 z-50 border-b border-border/40"
        onMouseLeave={() => setIsCategoriesHovered(false)}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-background relative z-50">
          {/* Hamburger button */}
          <button
            className="lg:hidden text-foreground hover:text-brand transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 h-full">
            <Link href="/" className="text-sm font-semibold tracking-wider text-foreground hover:text-brand transition-colors">
              INICIO
            </Link>
            <Link href="/tienda" className="text-sm font-semibold tracking-wider text-foreground hover:text-brand transition-colors">
              TIENDA
            </Link>

            <div
              className="h-full flex items-center"
              onMouseEnter={() => setIsCategoriesHovered(true)}
            >
              <Link
                href="/tienda"
                className={`text-sm font-semibold tracking-wider transition-colors py-4 border-b-2 ${isCategoriesHovered
                    ? "text-brand border-brand"
                    : "text-foreground border-transparent hover:text-brand"
                  }`}
              >
                CATEGORÍAS
              </Link>
            </div>
          </nav>

          {/* Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide text-brand" style={{ fontFamily: 'Georgia, serif' }}>
              Casa Verde
            </Link>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              className="text-foreground hover:text-brand transition-colors"
              onClick={openSearchModal}
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                className={`transition-colors ${isUserMenuOpen ? "text-brand" : "text-foreground hover:text-brand"}`}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User className="w-5 h-5" />
              </button>
              {isUserMenuOpen && (
                <UserMenu onClose={() => setIsUserMenuOpen(false)} />
              )}
            </div>

            {/* BOTÓN DEL CARRITO */}
            <button
              className="text-foreground hover:text-brand transition-colors relative"
              onClick={openCart}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#c19a6b] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-in zoom-in duration-300">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* MEGA MENU (DESKTOP) */}
        <div
          className={`hidden lg:block absolute top-full left-0 w-full bg-background border-b border-border shadow-lg transition-all duration-300 ease-in-out z-40 overflow-hidden ${isCategoriesHovered ? "opacity-100 visible max-h-[400px]" : "opacity-0 invisible max-h-0"
            }`}
          onMouseEnter={() => setIsCategoriesHovered(true)}
          onMouseLeave={() => setIsCategoriesHovered(false)}
        >
          <div className="container mx-auto px-8 py-10">
            <div className="grid grid-cols-4 gap-8">
              {megaMenuData.map((column, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <h3 className="text-sm font-bold tracking-widest text-muted-foreground uppercase">
                    {column.title}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {column.items.map((item, j) => (
                      <Link
                        key={j}
                        href={`/tienda?categoria=${item.slug}`}
                        className="text-sm text-foreground hover:text-brand hover:underline transition-all"
                        onClick={() => setIsCategoriesHovered(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {menuOpen && (
          <nav className="lg:hidden absolute top-full left-0 w-full bg-background border-b border-border z-50 shadow-md h-screen sm:h-auto overflow-y-auto">
            <div className="flex flex-col px-6 py-6 gap-6 bg-background">
              <button
                className="flex items-center gap-2 text-lg font-semibold tracking-wider text-foreground hover:text-brand pb-2 border-b border-border/50 text-left"
                onClick={openSearchModal}
              >
                <Search className="w-5 h-5" /> BUSCAR
              </button>

              <Link href="/" className="text-lg font-semibold tracking-wider text-foreground hover:text-brand pb-2 border-b border-border/50" onClick={() => setMenuOpen(false)}>INICIO</Link>
              <Link href="/tienda" className="text-lg font-semibold tracking-wider text-foreground hover:text-brand pb-2 border-b border-border/50" onClick={() => setMenuOpen(false)}>TIENDA</Link>

              <div className="flex flex-col gap-4 pb-2 border-b border-border/50">
                <span className="text-lg font-semibold tracking-wider text-brand">CATEGORÍAS</span>
                {megaMenuData.map((group) => (
                  <div key={group.title} className="pl-4 border-l-2 border-border/50">
                    <span className="text-sm font-bold text-muted-foreground block mb-2">{group.title}</span>
                    {group.items.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/tienda?categoria=${item.slug}`}
                        className="block text-sm text-foreground py-1"
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>

              <Link href="/cuenta" className="text-lg font-semibold tracking-wider text-foreground hover:text-brand flex items-center gap-2 pt-2" onClick={() => setMenuOpen(false)}>
                <User className="w-5 h-5" /> MI CUENTA
              </Link>
            </div>
          </nav>
        )}
      </header>

      {/* RENDERIZADO DE MODALES */}
      {isSearchModalOpen && (
        <SearchModal onClose={() => setIsSearchModalOpen(false)} />
      )}

      {/* RENDERIZAMOS EL CARRITO */}
      <CartDrawer />
    </>
  );
};

export default Header;