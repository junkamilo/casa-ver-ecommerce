"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import logoIcon from "@/assets/logo-icon.png"; // Asegúrate de que esta ruta sea correcta
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  BarChart3,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Menu,
  X,
  Store,
  Shield,
  UserCog,
  Tag
} from "lucide-react";

// Navegación
const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Inventario", href: "/admin/productos", icon: Package },
  { label: "Categorías", href: "/admin/categorias", icon: Tag },
  { label: "Pedidos", href: "/admin/pedidos", icon: ClipboardList },
  { label: "Reportes", href: "/admin/estadisticas", icon: BarChart3 },
  { label: "Admins", href: "/admin/administradores", icon: Shield },
  { label: "Mi Perfil", href: "/admin/perfil", icon: UserCog },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Verificación de Admin
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // --- LOADING SCREEN ---
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#154734]" />
        <p className="text-sm text-gray-500 font-medium animate-pulse">Cargando panel...</p>
      </div>
    );
  }

  // --- ACCESS DENIED SCREEN ---
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Esta área es exclusiva para administradores de <strong>Casa Verde</strong>.
            Si crees que esto es un error, contacta a soporte.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-[#154734] text-white px-6 py-3 rounded-xl hover:bg-[#103a2a] transition-all w-full font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la Tienda
          </Link>
        </div>
      </div>
    );
  }

  // --- LAYOUT PRINCIPAL ---
  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-[#154734] text-white shadow-xl z-20">

        {/* --- LOGO AREA MEJORADA --- */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          {/* Logo Circular */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-[#C19A6B]/50 shadow-sm">
            <Image
              src={logoIcon}
              alt="CV"
              fill
              className="object-cover" // <--- CAMBIO CLAVE: object-cover llena todo el círculo
              priority
            />
          </div>

          {/* Texto de Marca */}
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-wide text-white leading-none" style={{ fontFamily: "Georgia, serif" }}>
              Casa Verde
            </h1>
            <span className="text-[10px] font-bold tracking-widest text-[#C19A6B] uppercase mt-1">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                  ? "bg-white text-[#154734] shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-[#154734]" : "text-white/70 group-hover:text-white"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0f3626]/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-[#C19A6B] text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-[#154734]">
              {session?.user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
              <p className="text-xs text-white/50 truncate">Administrador</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors"
          >
            <Store className="w-4 h-4" /> Ir a la Tienda
          </Link>
        </div>
      </aside>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />

          <aside className="relative w-64 bg-[#154734] text-white flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="p-5 border-b border-white/10 flex justify-between items-center">

              {/* Logo Mobile */}
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-[#C19A6B]">
                  <Image src={logoIcon} alt="CV" fill className="object-cover" />
                </div>
                <span className="font-bold font-serif">Casa Verde</span>
              </div>

              <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-white/10 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 py-4 px-3 space-y-1">
              {adminNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-white text-[#154734]" : "text-white/70 hover:bg-white/10"
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-white/10">
              <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white text-sm">
                <ArrowLeft className="w-4 h-4" /> Volver a Tienda
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-8 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden sm:flex items-center text-sm text-gray-500">
              <span className="font-medium text-gray-900">Admin</span>
              <span className="mx-2">/</span>
              <span className="capitalize text-[#154734]">
                {pathname === "/admin" ? "Dashboard" : pathname.split("/").pop()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-[#154734] transition-colors flex items-center gap-2">
              <span className="hidden sm:inline">Ver Tienda</span>
              <Store className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}