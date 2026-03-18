import Link from "next/link";
import Image from "next/image";
import { X, ArrowLeft } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { ADMIN_NAV } from "../../constants";

interface Props {
  isOpen: boolean;
  pathname: string;
  onClose: () => void;
}

export default function AdminMobileSidebar({ isOpen, pathname, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel lateral */}
      <aside className="relative w-64 bg-[#154734] text-white flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-300">

        {/* Header móvil */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-[#C19A6B]">
              <Image src={logoIcon} alt="CV" fill className="object-cover" />
            </div>
            <span className="font-bold font-serif">Casa Verde</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded"
            aria-label="Cerrar menú"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {ADMIN_NAV.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white text-[#154734]"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/80 hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Tienda
          </Link>
        </div>
      </aside>
    </div>
  );
}
