import Link from "next/link";
import { Search, User, Shield } from "lucide-react";
import { megaMenuData, HOVER_BRAND, BORDER_BRAND, TEXT_BRAND } from "../constants/constants";

interface Props {
  isAdmin: boolean;
  onClose: () => void;
  onSearchOpen: () => void;
}

export default function MobileMenu({ isAdmin, onClose, onSearchOpen }: Props) {
  return (
    <nav className="lg:hidden absolute top-full left-0 w-full bg-background border-b border-border z-50 shadow-md h-[calc(100vh-64px)] overflow-y-auto">
      <div className="flex flex-col px-6 py-6 gap-6 bg-background">
        <button
          className={`flex items-center gap-3 text-lg font-semibold tracking-wider text-foreground ${HOVER_BRAND} pb-4 border-b border-border/50 text-left`}
          onClick={onSearchOpen}
        >
          <Search className="w-5 h-5" /> BUSCAR
        </button>

        <Link
          href="/"
          className={`text-lg font-semibold tracking-wider text-foreground ${HOVER_BRAND} pb-2`}
          onClick={onClose}
        >
          INICIO
        </Link>
        <Link
          href="/tienda"
          className={`text-lg font-semibold tracking-wider text-foreground ${HOVER_BRAND} pb-2`}
          onClick={onClose}
        >
          TIENDA
        </Link>

        <div className="flex flex-col gap-6 pt-2">
          <span
            className={`text-lg font-bold tracking-wider ${TEXT_BRAND} border-b border-border pb-2`}
          >
            CATEGORÍAS
          </span>
          {megaMenuData.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                {group.title}
              </span>
              {group.items.map((item) => (
                <Link
                  key={item.slug}
                  href={`/collections/${item.slug}`}
                  className={`block text-sm text-foreground pl-2 border-l-2 border-transparent hover:${BORDER_BRAND} ${HOVER_BRAND} transition-all`}
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {isAdmin && (
          <div className="flex flex-col gap-3 pt-4 border-t border-border">
            <span className="text-xs font-bold text-[#C19A6B] uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4" />
              PANEL ADMIN
            </span>
            {[
              { href: "/admin", label: "Dashboard" },
              { href: "/admin/productos", label: "Gestionar Productos" },
              { href: "/admin/pedidos", label: "Ver Pedidos" },
              { href: "/admin/estadisticas", label: "Estadísticas" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`block text-sm text-foreground pl-2 border-l-2 border-transparent hover:${BORDER_BRAND} ${HOVER_BRAND} transition-all`}
                onClick={onClose}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/cuenta"
          className={`text-lg font-semibold tracking-wider text-foreground ${HOVER_BRAND} flex items-center gap-3 pt-4 border-t border-border`}
          onClick={onClose}
        >
          <User className="w-5 h-5" /> MI CUENTA
        </Link>
      </div>
    </nav>
  );
}
