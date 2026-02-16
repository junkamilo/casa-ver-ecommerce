"use client";

import Link from "next/link";
import { Package, User, X } from "lucide-react";

interface UserMenuProps {
  onClose: () => void;
}

const UserMenu = ({ onClose }: UserMenuProps) => {
  return (
    <>
      {/* Overlay móvil - solo visible en pantallas pequeñas */}
      <div
        className="fixed inset-0 bg-black/50 z-40 sm:hidden"
        onClick={onClose}
      />

      {/* Menú: bottom-sheet en móvil, popover flotante en desktop */}
      <div
        className="fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-auto sm:left-auto sm:top-full sm:right-0 sm:mt-3 w-full sm:w-85 bg-background rounded-t-2xl sm:rounded-xl shadow-2xl border border-border p-5 sm:p-6 z-50 animate-in fade-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200"
        onMouseLeave={() => {
          // Solo cerrar con mouse leave en desktop
          if (window.innerWidth >= 640) onClose();
        }}
      >
        {/* Indicador de arrastre - solo móvil */}
        <div className="flex justify-center mb-3 sm:hidden">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">Cuenta</h2>
          <button onClick={onClose} className="sm:hidden text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botón morado de Shop */}
        <button className="w-full bg-[#5a31f4] hover:bg-[#4c28cc] text-white font-medium py-3 sm:py-3.5 rounded-lg mb-3 transition-colors flex items-center justify-center shadow-sm text-sm sm:text-base">
          <span>Iniciar sesión con shop</span>
        </button>

        {/* Botón secundario (Color marca/café) */}
        <button className="w-full bg-[#c19a6b] hover:bg-[#a88659] text-white font-medium py-3 sm:py-3.5 rounded-lg mb-6 sm:mb-8 transition-colors shadow-sm text-sm sm:text-base">
          Otras opciones de inicio de sesión
        </button>

        {/* Botones de Pedidos y Perfil */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Link
            href="/pedidos"
            className="flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 sm:py-3 hover:bg-muted/50 transition-colors text-foreground font-medium group text-sm"
            onClick={onClose}
          >
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground" />
            Pedidos
          </Link>
          <Link
            href="/perfil"
            className="flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 sm:py-3 hover:bg-muted/50 transition-colors text-foreground font-medium group text-sm"
            onClick={onClose}
          >
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-foreground" />
            Perfil
          </Link>
        </div>
      </div>
    </>
  );
};

export default UserMenu;
