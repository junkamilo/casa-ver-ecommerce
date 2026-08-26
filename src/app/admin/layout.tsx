"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/layout/LoadingScreen";
import AccessDenied from "./components/layout/AccessDenied";
import AppTopHeader from "@/components/layout/AppTopHeader";
import NotificationsBell from "./components/layout/NotificationsBell";
import AppSidebar from "@/components/layout/AppSidebar";
import { Toaster } from "@/components/ui/sonner";
import { ADMIN_NAV } from "./constants";
import { buildAdminSidebarNav, getAdminPageLabel } from "./utils/build-sidebar-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";
  const userName = session?.user?.name;
  const userInitial = userName?.charAt(0).toUpperCase() ?? "A";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      queueMicrotask(() => setIsSidebarOpen(false));
    }
  }, [pathname]);

  if (status === "loading") return <LoadingScreen />;
  if (!isAdmin) return <AccessDenied />;

  const sidebarNav = buildAdminSidebarNav(ADMIN_NAV, pathname);

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <AppSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        navItems={sidebarNav}
        brandSubtitle="Admin Panel"
        userName={userName}
        userInitial={userInitial}
        userRole="Administrador"
        backLink={{ href: "/", label: "Ir a la Tienda" }}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AppTopHeader
          onMenuOpen={() => setIsSidebarOpen(!isSidebarOpen)}
          breadcrumbRoot="Admin"
          breadcrumbCurrent={getAdminPageLabel(pathname)}
          rightSlot={<NotificationsBell />}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 scrollbar-hide">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Toaster position="top-right" closeButton offset="5rem" />
    </div>
  );
}
