"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/layout/LoadingScreen";
import AccessDenied from "./components/layout/AccessDenied";
import AdminSidebar from "./components/layout/AdminSidebar";
import AdminMobileSidebar from "./components/layout/AdminMobileSidebar";
import AdminTopHeader from "./components/layout/AdminTopHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const userInitial = session?.user?.name?.charAt(0).toUpperCase() ?? "A";

  // Redirige a login si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Cierra el menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (status === "loading") return <LoadingScreen />;
  if (!isAdmin) return <AccessDenied />;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <AdminSidebar
        pathname={pathname}
        userName={session?.user?.name}
        userInitial={userInitial}
      />

      <AdminMobileSidebar
        isOpen={isMobileMenuOpen}
        pathname={pathname}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminTopHeader
          pathname={pathname}
          onMenuOpen={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
