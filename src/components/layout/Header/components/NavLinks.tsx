import Link from "next/link";
import { TEXT_BRAND } from "../constants/constants";
import type { NavLinksProps } from "../types";

export default function NavLinks({ isCategoriesActive, onCategoriesEnter }: NavLinksProps) {
  return (
    <nav className="hidden lg:flex items-center gap-8" aria-label="Navegación principal">

      {/* ────────────────────────────────────────────────
          INICIO — Underline que nace del centro
      ──────────────────────────────────────────────── */}
      <div className="relative group flex flex-col items-center gap-0.5 py-1">
        <Link
          href="/"
          className="relative text-xs font-bold tracking-[0.18em] text-foreground/70 group-hover:text-[#154734] transition-all duration-300 group-hover:-translate-y-px"
        >
          INICIO
        </Link>

        {/* Underline que crece desde el centro hacia afuera */}
        <span className="relative h-px w-full overflow-hidden flex">
          <span className="absolute right-1/2 top-0 bottom-0 w-0 group-hover:w-1/2 bg-linear-to-l from-[#C19A6B] to-[#C19A6B]/20 transition-all duration-350 ease-out" />
          <span className="absolute left-1/2 top-0 bottom-0 w-0 group-hover:w-1/2 bg-linear-to-r from-[#C19A6B] to-[#C19A6B]/20 transition-all duration-350 ease-out" />
        </span>
      </div>

      {/* ────────────────────────────────────────────────
          TIENDA — Underline + destello de izquierda
      ──────────────────────────────────────────────── */}
      <div className="relative group flex flex-col items-center gap-0.5 py-1">
        <Link
          href="/tienda"
          className="relative text-xs font-bold tracking-[0.18em] text-foreground/70 group-hover:text-[#154734] transition-all duration-300 group-hover:-translate-y-px"
        >
          TIENDA
        </Link>

        {/* Underline desde el centro hacia afuera */}
        <span className="relative h-px w-full overflow-hidden flex">
          <span className="absolute right-1/2 top-0 bottom-0 w-0 group-hover:w-1/2 bg-linear-to-l from-[#C19A6B] to-[#C19A6B]/20 transition-all duration-350 ease-out" />
          <span className="absolute left-1/2 top-0 bottom-0 w-0 group-hover:w-1/2 bg-linear-to-r from-[#C19A6B] to-[#C19A6B]/20 transition-all duration-350 ease-out" />
        </span>
      </div>

      {/* ────────────────────────────────────────────────
          CATEGORÍAS — Estado activo permanente + diamante
          que "sujeta" al megamenú abierto
      ──────────────────────────────────────────────── */}
      <div
        className="relative group flex flex-col items-center gap-0 py-1"
        onMouseEnter={onCategoriesEnter}
      >
        <Link
          href="/tienda"
          className={`relative text-xs font-bold tracking-[0.18em] transition-all duration-300 py-2 ${
            isCategoriesActive
              ? `${TEXT_BRAND} -translate-y-px`
              : "text-foreground/70 hover:text-[#154734] hover:-translate-y-px"
          }`}
        >
          CATEGORÍAS
        </Link>

        {/* Underline: crece desde el centro cuando activo */}
        <span className="relative h-px w-full overflow-hidden flex">
          <span
            className={`absolute right-1/2 top-0 bottom-0 bg-linear-to-l from-[#C19A6B] to-[#C19A6B]/20 transition-all duration-350 ease-out ${
              isCategoriesActive ? "w-1/2" : "w-0 group-hover:w-1/2"
            }`}
          />
          <span
            className={`absolute left-1/2 top-0 bottom-0 bg-linear-to-r from-[#C19A6B] to-[#C19A6B]/20 transition-all duration-350 ease-out ${
              isCategoriesActive ? "w-1/2" : "w-0 group-hover:w-1/2"
            }`}
          />
        </span>

      </div>
    </nav>
  );
}
