"use client";

import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Package, User, X, LogOut, Loader2, Shield } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";

interface UserMenuProps {
  onClose: () => void;
}

const UserMenu = ({ onClose }: UserMenuProps) => {
  const { data: session, status } = useSession();

  const menuContent = (
    <>
      {/* Handle — solo visible en móvil */}
      <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5 sm:hidden" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          {status === "authenticated" ? `Hola, ${session.user?.name?.split(" ")[0]}` : "Mi Cuenta"}
        </h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors active:scale-90">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Cargando */}
      {status === "loading" && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#154734]" />
        </div>
      )}

      {/* No logueado */}
      {status === "unauthenticated" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground mb-1">
            Inicia sesión para ver tus pedidos y guardar favoritos.
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all shadow-sm active:scale-95 text-sm sm:text-base"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Iniciar sesión con Google
          </button>
          <Link href="/registro" onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-[#154734] hover:bg-[#1a5c43] text-white font-medium py-3 px-4 rounded-lg transition-all active:scale-95 text-sm sm:text-base"
          >
            <User className="w-4 h-4 shrink-0" />
            Registrarse
          </Link>
          <Link href="/login" onClick={onClose}
            className="w-full flex items-center justify-center gap-2 border-2 border-[#154734] text-[#154734] hover:bg-[#154734]/5 font-medium py-3 px-4 rounded-lg transition-all active:scale-95 text-sm sm:text-base"
          >
            <LogOut className="w-4 h-4 shrink-0 rotate-180" />
            Iniciar sesión
          </Link>
        </div>
      )}

      {/* Logueado */}
      {status === "authenticated" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            {session.user?.image ? (
              <Image src={session.user.image} alt="Avatar" width={40} height={40} className="rounded-full border border-gray-200" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#154734] text-white flex items-center justify-center font-bold text-lg">
                {session.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{session.user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
            </div>
          </div>

          {(session.user as { role?: string })?.role === "ADMIN" && (
            <Link href="/admin" onClick={onClose}
              className="flex items-center gap-3 p-3 bg-[#154734]/5 border border-[#154734]/20 rounded-lg hover:bg-[#154734]/10 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-[#154734] flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#154734]">Panel Admin</p>
                <p className="text-xs text-gray-500">Gestionar tienda</p>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Link href="/perfil?section=pedidos" onClick={onClose}
              className="flex flex-col items-center justify-center gap-2 border border-border rounded-lg py-3 hover:bg-muted/50 hover:border-[#C19A6B] transition-all text-foreground font-medium group text-sm"
            >
              <Package className="w-5 h-5 text-muted-foreground group-hover:text-[#C19A6B]" />
              Mis Pedidos
            </Link>
            <Link href="/perfil" onClick={onClose}
              className="flex flex-col items-center justify-center gap-2 border border-border rounded-lg py-3 hover:bg-muted/50 hover:border-[#C19A6B] transition-all text-foreground font-medium group text-sm"
            >
              <User className="w-5 h-5 text-muted-foreground group-hover:text-[#C19A6B]" />
              Mi Perfil
            </Link>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center justify-center gap-2 w-full mt-2 text-red-600 hover:bg-red-50 py-2 rounded-md transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </>
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Overlay — cubre toda la pantalla */}
      <div
        className="fixed inset-0 z-9998 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 flex items-end sm:items-center justify-center sm:p-4"
        onClick={onClose}
      >
        {/* Contenedor — bottom sheet en móvil, modal centrado en desktop */}
        <div
          className="bg-background w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-border p-6 max-h-[85dvh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
          onMouseLeave={() => {
            if (window.innerWidth >= 640) onClose();
          }}
        >
          {menuContent}
        </div>
      </div>
    </>,
    document.body
  );
};

export default UserMenu;
