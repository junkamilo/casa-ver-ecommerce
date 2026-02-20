import Link from "next/link";
import { Search, User, Shield, ChevronRight } from "lucide-react";
import { megaMenuData, HOVER_BRAND, TEXT_BRAND } from "../constants/constants";

interface Props {
  isAdmin: boolean;
  onClose: () => void;
  onSearchOpen: () => void;
}

export default function MobileMenu({ isAdmin, onClose, onSearchOpen }: Props) {
  return (
    <nav
      className="lg:hidden absolute top-full left-0 w-full border-b border-border/40 z-50 shadow-premium-lg h-[calc(100vh-64px)] overflow-y-auto animate-menu-slide"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,1) 60%)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* ── Franja decorativa dorada en el tope del drawer ── */}
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

        {/* ── CATEGORÍAS ── */}
        <div className="flex flex-col gap-4 pt-4 mt-2">

          {/* Título con línea dorada */}
          <div className="flex items-center gap-3">
            <div className="h-px w-4 bg-[#C19A6B]" />
            <span className={`text-xs font-bold tracking-[0.2em] ${TEXT_BRAND} uppercase`}>
              CATEGORÍAS
            </span>
            <div className="h-px flex-1 bg-linear-to-r from-[#C19A6B]/30 to-transparent" />
          </div>

          {megaMenuData.map((group, groupIdx) => (
            <div
              key={group.title}
              className="flex flex-col gap-2.5"
              style={{ animationDelay: `${groupIdx * 40}ms` }}
            >
              {/* Subtítulo de grupo */}
              <span className="text-[10px] font-bold text-[#C19A6B] uppercase tracking-[0.25em] pl-3">
                {group.title}
              </span>

              {/* Links de la categoría */}
              {group.items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/collections/${item.slug}`}
                  className={`relative group flex items-center gap-2 text-sm text-foreground/75 ${HOVER_BRAND} transition-all duration-200 pl-4 py-0.5`}
                  onClick={onClose}
                >
                  {/* Barra izquierda dorada */}
                  <span
                    className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-[#C19A6B] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top rounded-full"
                    aria-hidden="true"
                  />
                  <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          ))}
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
