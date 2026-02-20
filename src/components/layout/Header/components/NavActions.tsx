import Link from "next/link";
import { Search, User, ShoppingBag, Shield } from "lucide-react";
import UserMenu from "@/components/UserMenu";
import { TEXT_BRAND } from "../constants/constants";

interface Props {
  isAdmin: boolean;
  cartCount: number;
  isUserMenuOpen: boolean;
  onSearchOpen: () => void;
  onCartOpen: () => void;
  onUserMenuToggle: () => void;
  onUserMenuClose: () => void;
}

export default function NavActions({
  isAdmin,
  cartCount,
  isUserMenuOpen,
  onSearchOpen,
  onCartOpen,
  onUserMenuToggle,
  onUserMenuClose,
}: Props) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">

      {/* ────────────────────────────────────────────────
          ADMIN  — Escudo dorado con dot de vida
      ──────────────────────────────────────────────── */}
      {isAdmin && (
        <Link
          href="/admin"
          className="group relative flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-400"
          style={{ perspective: "200px" }}
          aria-label="Panel Admin"
          title="Panel Admin"
        >
          {/* Fondo que se ilumina en hover */}
          <span
            className="absolute inset-0 rounded-xl bg-[#C19A6B]/0 group-hover:bg-[#C19A6B]/10 border border-transparent group-hover:border-[#C19A6B]/30 transition-all duration-400"
            aria-hidden="true"
          />
          {/* Escudo — gira sutilmente en 3D */}
          <Shield
            className="relative w-[17px] h-[17px] text-[#C19A6B] transition-all duration-400 group-hover:scale-110"
            strokeWidth={1.5}
          />
          {/* Dot de estado — pulso de vida */}
          <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C19A6B] opacity-70" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#C19A6B]" />
          </span>
          {/* Micro-etiqueta */}
          <span className="text-[6.5px] font-black tracking-[0.18em] text-[#C19A6B]/0 group-hover:text-[#C19A6B] transition-colors duration-300 uppercase leading-none select-none">
            ADMIN
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
        className="group relative flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-400 cursor-pointer"
        onClick={onSearchOpen}
        aria-label="Buscar"
      >
        {/* Fondo tintado */}
        <span
          className="absolute inset-0 rounded-xl bg-[#154734]/0 group-hover:bg-[#154734]/6 border border-transparent group-hover:border-[#154734]/10 transition-all duration-400"
          aria-hidden="true"
        />
        {/* Anillo exterior que pulsa al expandir */}
        <span
          className="absolute inset-0 rounded-xl border border-[#C19A6B]/0 group-hover:border-[#C19A6B]/35 scale-75 group-hover:scale-105 transition-all duration-500 ease-out"
          aria-hidden="true"
        />
        {/* Ícono — rota en hover como una lupa escaneando */}
        <Search
          className="relative w-[17px] h-[17px] text-foreground/60 group-hover:text-[#154734] transition-all duration-350 group-hover:-rotate-12 group-hover:scale-110"
          strokeWidth={1.5}
        />
        {/* Micro-etiqueta */}
        <span className="text-[6.5px] font-black tracking-[0.18em] text-transparent group-hover:text-[#C19A6B] transition-colors duration-300 uppercase leading-none select-none">
          BUSCAR
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
          className={`group relative flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-400 cursor-pointer ${
            isUserMenuOpen ? TEXT_BRAND : ""
          }`}
          onClick={onUserMenuToggle}
          aria-label="Mi cuenta"
        >
          {/* Fondo */}
          <span
            className={`absolute inset-0 rounded-xl border transition-all duration-400 ${
              isUserMenuOpen
                ? "bg-[#154734]/8 border-[#154734]/20"
                : "bg-[#154734]/0 group-hover:bg-[#154734]/6 border-transparent group-hover:border-[#154734]/10"
            }`}
            aria-hidden="true"
          />
          {/* Arco dorado — corona que aparece sobre el ícono */}
          <span
            className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-1.5 border-t-[1.5px] border-l-[1.5px] border-r-[1.5px] rounded-t-full transition-all duration-400 border-[#C19A6B]/0 group-hover:border-[#C19A6B]/55"
            aria-hidden="true"
          />
          {/* Ícono */}
          <User
            className={`relative w-[17px] h-[17px] transition-all duration-350 group-hover:scale-105 ${
              isUserMenuOpen ? "text-[#154734]" : "text-foreground/60 group-hover:text-[#154734]"
            }`}
            strokeWidth={1.5}
          />
          {/* Micro-etiqueta */}
          <span
            className={`text-[6.5px] font-black tracking-[0.18em] uppercase leading-none select-none transition-colors duration-300 ${
              isUserMenuOpen ? "text-[#154734]" : "text-transparent group-hover:text-[#C19A6B]"
            }`}
          >
            CUENTA
          </span>
          {/* Anillo activo cuando el menú está abierto */}
          {isUserMenuOpen && (
            <span
              className="absolute inset-0 -m-0.5 rounded-xl border-2 border-[#C19A6B]/40 animate-in zoom-in-90 duration-200"
              aria-hidden="true"
            />
          )}
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
        className="group relative flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all duration-400 cursor-pointer"
        onClick={onCartOpen}
        aria-label="Carrito de compras"
      >
        {/* Fondo */}
        <span
          className="absolute inset-0 rounded-xl bg-[#154734]/0 group-hover:bg-[#154734]/6 border border-transparent group-hover:border-[#154734]/10 transition-all duration-400"
          aria-hidden="true"
        />
        {/* Anillo verde exterior */}
        <span
          className="absolute inset-0 rounded-xl border border-[#C19A6B]/0 group-hover:border-[#C19A6B]/30 scale-75 group-hover:scale-105 transition-all duration-500 ease-out"
          aria-hidden="true"
        />

        {/* Ícono — se eleva y balancea como una bolsa siendo levantada */}
        <div className="relative">
          <ShoppingBag
            className="w-[17px] h-[17px] text-foreground/60 group-hover:text-[#154734] transition-all duration-350 group-hover:-translate-y-0.5 group-hover:rotate-3"
            strokeWidth={1.5}
          />
          {/* Badge de cantidad */}
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 flex" aria-label={`${cartCount} productos`}>
              {/* Ripple dorado exterior */}
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C19A6B] opacity-35"
                aria-hidden="true"
              />
              {/* Badge sólido */}
              <span className="relative flex items-center justify-center bg-[#C19A6B] text-white text-[8px] font-black w-4 h-4 rounded-full shadow-gold animate-in zoom-in duration-300 leading-none">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            </span>
          )}
        </div>

        {/* Micro-etiqueta */}
        <span className="text-[6.5px] font-black tracking-[0.18em] text-transparent group-hover:text-[#C19A6B] transition-colors duration-300 uppercase leading-none select-none">
          BOLSA
        </span>
      </button>
    </div>
  );
}
