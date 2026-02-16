"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  BarChart3,
  ArrowLeft,
  Loader2,
  ShieldAlert,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Productos", href: "/admin/productos", icon: Package },
  { label: "Pedidos", href: "/admin/pedidos", icon: ClipboardList },
  { label: "Estadísticas", href: "/admin/estadisticas", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
        <p className="text-gray-500 mb-6 text-center">No tienes permisos para acceder al panel de administración.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-[#154734] text-white px-6 py-3 rounded-lg hover:bg-[#1a5c43] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-[#154734] text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold tracking-wide" style={{ fontFamily: "Georgia, serif" }}>
              Casa Verde <span className="text-[#C19A6B]">Admin</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C19A6B] text-white flex items-center justify-center text-sm font-bold">
              {session?.user?.name?.charAt(0).toUpperCase() || "A"}
            </div>
            <span className="hidden sm:block text-sm text-white/80">{session?.user?.name}</span>
          </div>
        </div>
        {/* Nav tabs */}
        <nav className="flex overflow-x-auto px-4 sm:px-6 gap-1 border-t border-white/10">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-t-lg transition-colors whitespace-nowrap"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
