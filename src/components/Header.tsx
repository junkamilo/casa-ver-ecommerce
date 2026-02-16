"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, ShoppingBag, Menu, X, Shield } from "lucide-react";
import { useSession } from "next-auth/react";
import SearchModal from "@/components/SearchModal";
import UserMenu from "@/components/UserMenu";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/context/CartContext";

// LOGO ICONO (La casita)
import logoIcon from "@/assets/logo-icon.png";

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
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const openSearchModal = () => {
    setMenuOpen(false);
    setIsSearchModalOpen(true);
  };

  // --- DEFINICIÓN DE COLORES DE MARCA ---
  const BRAND_GREEN_HEX = "#154734"; // Verde oficial
  // const ACCENT_GOLD_HEX = "#C19A6B"; // Dorado (solo para detalles puntuales)

  // Clases reutilizables para mantener la coherencia
  const TEXT_BRAND = `text-[${BRAND_GREEN_HEX}]`;
  // CAMBIO CLAVE: El hover ahora es el Verde Corporativo, no el marrón/dorado.
  const HOVER_BRAND = `hover:text-[${BRAND_GREEN_HEX}]`;
  const BORDER_BRAND = `border-[${BRAND_GREEN_HEX}]`;

  return (
    <>
      <header
        className="w-full bg-background relative sticky top-0 z-50 border-b border-border/40 shadow-sm"
        onMouseLeave={() => setIsCategoriesHovered(false)}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-background relative z-50">

          {/* --- GRUPO IZQUIERDO: Hamburguesa + Logo Circular + Nav --- */}
          <div className="flex items-center gap-4 lg:gap-8">

            {/* Botón Menú Móvil */}
            <button
              className={`lg:hidden text-foreground ${HOVER_BRAND} transition-colors`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menú"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* LOGO ICONO (Circular) */}
            <Link href="/" className="shrink-0 block group">
              <Image
                src={logoIcon}
                alt="Logo"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover group-hover:opacity-80 transition-opacity shadow-sm"
                priority
              />
            </Link>

            {/* Navegación Escritorio */}
            <nav className="hidden lg:flex items-center gap-6">
              <Link
                href="/"
                className={`text-xs font-bold tracking-[0.15em] text-foreground ${HOVER_BRAND} transition-colors`}
              >
                INICIO
              </Link>
              <Link
                href="/tienda"
                className={`text-xs font-bold tracking-[0.15em] text-foreground ${HOVER_BRAND} transition-colors`}
              >
                TIENDA
              </Link>

              <div
                className="h-full flex items-center"
                onMouseEnter={() => setIsCategoriesHovered(true)}
              >
                <Link
                  href="/tienda"
                  className={`text-xs font-bold tracking-[0.15em] transition-colors py-4 border-b-2 ${
                    isCategoriesHovered
                      ? `${TEXT_BRAND} ${BORDER_BRAND}` // Activo: Verde
                      : `text-foreground border-transparent ${HOVER_BRAND}` // Hover: Verde
                  }`}
                >
                  CATEGORÍAS
                </Link>
              </div>
            </nav>
          </div>

          {/* --- CENTRO: TEXTO DE MARCA (Verde Oficial) --- */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Link
              href="/"
              className={`text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide ${TEXT_BRAND}`}
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Casa Verde
            </Link>
          </div>

          {/* --- DERECHA: ICONOS --- */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Admin Panel (solo visible para ADMIN) */}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-[#C19A6B] hover:text-[#154734] transition-colors relative group"
                aria-label="Panel Admin"
                title="Panel Admin"
              >
                <Shield className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-[#C19A6B] rounded-full group-hover:bg-[#154734] transition-colors" />
              </Link>
            )}

            <button
              className={`text-foreground ${HOVER_BRAND} transition-colors`}
              onClick={openSearchModal}
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Menú de Usuario */}
            <div className="relative">
              <button
                className={`transition-colors ${isUserMenuOpen ? TEXT_BRAND : `text-foreground ${HOVER_BRAND}`}`}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              >
                <User className="w-5 h-5" />
              </button>
              {isUserMenuOpen && (
                <UserMenu onClose={() => setIsUserMenuOpen(false)} />
              )}
            </div>

            {/* Carrito */}
            <button
              className={`text-foreground ${HOVER_BRAND} transition-colors relative`}
              onClick={openCart}
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                // La bolita de notificación la dejamos en dorado/bronce para que resalte como "acción"
                <span className="absolute -top-1.5 -right-1.5 bg-[#C19A6B] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-in zoom-in duration-300">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* MEGA MENU (DESKTOP) */}
        <div
          className={`hidden lg:block absolute top-full left-0 w-full bg-background/95 backdrop-blur-sm border-b border-border shadow-lg transition-all duration-300 ease-in-out z-40 overflow-hidden ${
            isCategoriesHovered ? "opacity-100 visible max-h-[400px]" : "opacity-0 invisible max-h-0"
          }`}
          onMouseEnter={() => setIsCategoriesHovered(true)}
          onMouseLeave={() => setIsCategoriesHovered(false)}
        >
          <div className="container mx-auto px-8 py-10">
            <div className="grid grid-cols-4 gap-8">
              {megaMenuData.map((column, i) => (
                <div key={i} className="flex flex-col gap-4">
                  {/* Títulos de columna en Verde Marca */}
                  <h3 className={`text-xs font-bold tracking-[0.2em] ${TEXT_BRAND} uppercase border-b border-border pb-2 mb-1`}>
                    {column.title}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {column.items.map((item, j) => (
                      <Link
                        key={j}
                        href={`/collections/${item.slug}`}
                        // Links normales en negro, hover en VERDE MARCA
                        className={`text-sm text-foreground ${HOVER_BRAND} hover:translate-x-1 transition-all`}
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

        {/* MENÚ MÓVIL */}
        {menuOpen && (
          <nav className="lg:hidden absolute top-full left-0 w-full bg-background border-b border-border z-50 shadow-md h-[calc(100vh-64px)] overflow-y-auto">
            <div className="flex flex-col px-6 py-6 gap-6 bg-background">
              <button
                className={`flex items-center gap-3 text-lg font-semibold tracking-wider text-foreground ${HOVER_BRAND} pb-4 border-b border-border/50 text-left`}
                onClick={openSearchModal}
              >
                <Search className="w-5 h-5" /> BUSCAR
              </button>

              <Link
                href="/"
                className={`text-lg font-semibold tracking-wider text-foreground ${HOVER_BRAND} pb-2`}
                onClick={() => setMenuOpen(false)}
              >
                INICIO
              </Link>
              <Link
                href="/tienda"
                className={`text-lg font-semibold tracking-wider text-foreground ${HOVER_BRAND} pb-2`}
                onClick={() => setMenuOpen(false)}
              >
                TIENDA
              </Link>

              <div className="flex flex-col gap-6 pt-2">
                <span className={`text-lg font-bold tracking-wider ${TEXT_BRAND} border-b border-border pb-2`}>CATEGORÍAS</span>
                {megaMenuData.map((group) => (
                  <div key={group.title} className="flex flex-col gap-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{group.title}</span>
                    {group.items.map((item) => (
                      <Link
                        key={item.slug}
                        href={`/collections/${item.slug}`}
                        // Hover móvil también en verde
                        className={`block text-sm text-foreground pl-2 border-l-2 border-transparent hover:${BORDER_BRAND} ${HOVER_BRAND} transition-all`}
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>

              {/* Admin Panel - Solo visible para ADMIN */}
              {isAdmin && (
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <span className="text-xs font-bold text-[#C19A6B] uppercase tracking-widest flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    PANEL ADMIN
                  </span>
                  <Link
                    href="/admin"
                    className={`block text-sm text-foreground pl-2 border-l-2 border-transparent hover:${BORDER_BRAND} ${HOVER_BRAND} transition-all`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/admin/productos"
                    className={`block text-sm text-foreground pl-2 border-l-2 border-transparent hover:${BORDER_BRAND} ${HOVER_BRAND} transition-all`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Gestionar Productos
                  </Link>
                  <Link
                    href="/admin/pedidos"
                    className={`block text-sm text-foreground pl-2 border-l-2 border-transparent hover:${BORDER_BRAND} ${HOVER_BRAND} transition-all`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Ver Pedidos
                  </Link>
                  <Link
                    href="/admin/estadisticas"
                    className={`block text-sm text-foreground pl-2 border-l-2 border-transparent hover:${BORDER_BRAND} ${HOVER_BRAND} transition-all`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Estadísticas
                  </Link>
                </div>
              )}

              <Link
                href="/cuenta"
                className={`text-lg font-semibold tracking-wider text-foreground ${HOVER_BRAND} flex items-center gap-3 pt-4 border-t border-border`}
                onClick={() => setMenuOpen(false)}
              >
                <User className="w-5 h-5" /> MI CUENTA
              </Link>
            </div>
          </nav>
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