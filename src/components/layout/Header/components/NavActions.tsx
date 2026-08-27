import Link from "next/link";
import UserMenu from "@/components/UserMenu";
import { PerfilAdminIcon, PerfilIcon, SearchIcon, ShoppingCart } from "@/components/icons";
import type { NavActionsProps } from "../types";

export default function NavActions({
  isAdmin,
  cartCount,
  isUserMenuOpen,
  onSearchOpen,
  onCartOpen,
  onUserMenuToggle,
  onUserMenuClose,
}: NavActionsProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">

      {/* ────────────────────────────────────────────────
          ADMIN  — Escudo dorado con dot de vida
      ──────────────────────────────────────────────── */}
      {isAdmin && (
        <Link
          href="/admin"
          className="flex items-center justify-center w-10 h-10"
          aria-label="Panel Admin"
          title="Panel Admin"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#154734] hover:bg-[#103a2a] transition-colors">
            <PerfilAdminIcon size={16} strokeWidth={1.5} className="text-white" />
          </span>
        </Link>
      )}

      {/* ── Separador dorado ── */}
      {isAdmin && <div className="w-px h-5 bg-[#C19A6B]/15 mx-0.5" aria-hidden="true" />}

      {/* ────────────────────────────────────────────────
          BUSCAR — La lupa que escanea
          · Rota -12° y crece en hover
          · Anillo exterior que expande desde el centro
          · Etiqueta "BUSCAR" que emerge en dorado
      ──────────────────────────────────────────────── */}
      <button
        className="flex items-center justify-center w-10 h-10 cursor-pointer"
        onClick={onSearchOpen}
        aria-label="Buscar"
        style={{ touchAction: "manipulation" }}
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#154734] hover:bg-[#103a2a] transition-colors">
          <SearchIcon size={16} strokeWidth={1.5} className="text-white" />
        </span>
      </button>

      {/* ── Separador dorado ── */}
      <div className="w-px h-5 bg-[#C19A6B]/15 mx-0.5" aria-hidden="true" />

      {/* ────────────────────────────────────────────────
          USUARIO — Identidad premium
          · Arco dorado superior (corona sutil) en hover
          · Marco cuadrado que gira 45° desde las esquinas
          · Anillo dorado cuando el menú está abierto
      ──────────────────────────────────────────────── */}
      <div className="relative">
        <button
          className="flex items-center justify-center w-10 h-10 cursor-pointer"
          onClick={onUserMenuToggle}
          aria-label="Mi cuenta"
        >
          <span
            className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
              isUserMenuOpen ? "bg-[#103a2a]" : "bg-[#154734] hover:bg-[#103a2a]"
            }`}
          >
            <PerfilIcon size={16} strokeWidth={1.5} className="text-white" />
          </span>
        </button>
        {isUserMenuOpen && <UserMenu onClose={onUserMenuClose} />}
      </div>

      {/* ── Separador dorado ── */}
      <div className="w-px h-5 bg-[#C19A6B]/15 mx-0.5" aria-hidden="true" />

      {/* ────────────────────────────────────────────────
          CARRITO — La bolsa que invita a comprar
          · Se eleva y balancea en hover
          · Badge con ripple dorado exterior
          · Micro-etiqueta "BOLSA" que emerge
      ──────────────────────────────────────────────── */}
      <button
        className="relative flex items-center justify-center w-10 h-10 cursor-pointer"
        onClick={onCartOpen}
        aria-label="Carrito de compras"
        style={{ touchAction: "manipulation" }}
      >
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#154734] hover:bg-[#103a2a] transition-colors">
          <ShoppingCart size={16} strokeWidth={1.5} className="text-white" />
        </span>
        {cartCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-4 h-4 px-0.5 rounded-full bg-[#C19A6B] text-white text-[8px] font-black leading-none"
            aria-label={`${cartCount} productos`}
          >
            {cartCount > 9 ? "9+" : cartCount}
          </span>
        )}
      </button>
    </div>
  );
}
