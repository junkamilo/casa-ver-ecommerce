import Link from "next/link";
import { Menu, Store } from "lucide-react";

interface Props {
  pathname: string;
  onMenuOpen: () => void;
}

const getPageLabel = (pathname: string): string => {
  if (pathname === "/admin") return "Dashboard";
  return pathname.split("/").pop() ?? "Panel";
};

export default function AdminTopHeader({ pathname, onMenuOpen }: Props) {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-8 shadow-sm z-10">
      <div className="flex items-center gap-4">
        {/* Botón hamburguesa (solo móvil) */}
        <button
          onClick={onMenuOpen}
          className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center text-sm text-gray-500">
          <span className="font-medium text-gray-900">Admin</span>
          <span className="mx-2">/</span>
          <span className="capitalize text-[#154734]">{getPageLabel(pathname)}</span>
        </div>
      </div>

      {/* Acciones derecha */}
      <div className="flex items-center gap-4">
        <div className="h-8 w-[1px] bg-gray-200 hidden sm:block" />
        <Link
          href="/"
          className="text-sm font-medium text-gray-600 hover:text-[#154734] transition-colors flex items-center gap-2"
        >
          <span className="hidden sm:inline">Ver Tienda</span>
          <Store className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
