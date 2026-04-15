"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { TEXT_BRAND } from "../constants/constants";
import type { MegaMenuProps } from "../types";

// Delays escalonados para que cada columna entre con un pequeño retraso
const COLUMN_DELAYS = ["0ms", "60ms", "120ms", "180ms", "240ms", "300ms"];

export default function MegaMenu({ visible, categories, onEnter, onLeave, onClose }: MegaMenuProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTipo = searchParams.get("tipo");

  return (
    <div
      className={`hidden lg:block absolute top-full left-0 w-full bg-background/97 backdrop-blur-xl border-b border-border/30 shadow-premium-lg transition-all duration-350 ease-out z-40 overflow-hidden ${
        visible ? "opacity-100 visible max-h-170" : "opacity-0 invisible max-h-0"
      }`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* ── Línea dorada superior — efecto que respira ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#C19A6B]/70 to-transparent animate-border-shimmer" />

      {/* ── Barrido de luz dorada — firma de lujo ── */}
      <div
        className={`absolute top-0 bottom-0 w-32 pointer-events-none z-20 ${visible ? "animate-shine-sweep" : ""}`}
        style={{
          background:
            "linear-gradient(105deg, transparent 30%, rgba(193,154,107,0.1) 50%, transparent 70%)",
          filter: "blur(3px)",
        }}
        aria-hidden="true"
      />

      {/* ── Degradado sutil en el fondo — Aurora verde ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 100% at 50% 0%, #154734 0%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-8 py-10 relative">
        {/* ── Estado vacío ── */}
        {categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-6 gap-2">
            <span
              className="w-5 h-5 rounded-full border-2 border-[#C19A6B]/40 border-t-[#C19A6B] animate-spin"
              aria-hidden="true"
            />
            <p className="italic text-sm text-[#C19A6B]/70">
              Colecciones en preparación.
            </p>
          </div>
        )}

        <div
          className="grid gap-8"
          style={{
            gridTemplateColumns: categories.length > 0
              ? `repeat(${Math.min(categories.length, 6)}, minmax(0, 1fr))`
              : "1fr",
          }}
        >
          {categories.map((category, colIdx) => {
            const isCategoryActive = pathname === `/collections/${category.slug}`;
            const hasGarmentTypes = category.garmentTypes.length > 0;

            return (
              <div
                key={category.id}
                className={`flex flex-col gap-3 transition-all duration-400 ease-out ${
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
                style={{ transitionDelay: visible ? COLUMN_DELAYS[colIdx] ?? "0ms" : "0ms" }}
              >
                {/* ── Título de columna (Categoría Principal) ── */}
                <div>
                  <div className="h-px w-8 bg-linear-to-r from-[#C19A6B] to-[#C19A6B]/20 mb-3" />
                  <Link
                    href={`/collections/${category.slug}`}
                    className={`relative text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-200 ${
                      isCategoryActive
                        ? "text-[#154734]"
                        : `${TEXT_BRAND} hover:text-[#C19A6B]`
                    }`}
                    onClick={onClose}
                  >
                    {category.name.toUpperCase()}
                    {isCategoryActive && (
                      <span className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-[#C19A6B] rounded-full" />
                    )}
                  </Link>
                </div>

                {/* ── Separador ── */}
                <div className="h-px bg-border/40 w-full" />

                {/* ── Tipos de prenda ── */}
                {hasGarmentTypes && (
                  <div className="flex flex-col gap-2">
                    {category.garmentTypes.map((gt) => {
                      const href = `/collections/${category.slug}?tipo=${gt.slug}`;
                      const isGarmentActive =
                        pathname === `/collections/${category.slug}` &&
                        activeTipo === gt.slug;

                      return (
                        <Link
                          key={gt.id}
                          href={href}
                          className={`relative group flex items-center text-sm font-normal transition-colors duration-300 pl-3 min-w-0 ${
                            isGarmentActive
                              ? "text-[#C19A6B]"
                              : "text-gray-400 hover:text-[#C19A6B]"
                          }`}
                          onClick={onClose}
                        >
                          {/* Barra izquierda dorada: permanente si activo, aparece en hover */}
                          <span
                            className={`absolute left-0 top-0 bottom-0 w-[1.5px] rounded-full bg-[#C19A6B] origin-top transition-all duration-200 ${
                              isGarmentActive
                                ? "scale-y-100"
                                : "scale-y-0 group-hover:scale-y-100"
                            }`}
                            aria-hidden="true"
                          />
                          <span
                            className={`transition-transform duration-200 leading-snug truncate ${
                              isGarmentActive
                                ? "translate-x-0.5 font-medium underline underline-offset-2 decoration-[#C19A6B]/60 decoration-1"
                                : "group-hover:translate-x-0.5"
                            }`}
                          >
                            {gt.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* ── Fallback: enlace "Ver todo" si no hay tipos de prenda ── */}
                {!hasGarmentTypes && (
                  <Link
                    href={`/collections/${category.slug}`}
                    className="text-sm text-gray-400 hover:text-[#C19A6B] pl-3 transition-colors duration-200"
                    onClick={onClose}
                  >
                    Ver todo
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Línea dorada inferior sutil ── */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#C19A6B]/20 to-transparent" />
    </div>
  );
}
