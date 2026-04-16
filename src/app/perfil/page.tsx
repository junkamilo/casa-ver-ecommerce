"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import AppTopHeader from "@/components/layout/AppTopHeader";
import AppSidebar from "@/components/layout/AppSidebar";

import { useProfile } from "./hooks/useProfile";
import { useProfileNav } from "./sidebar/hooks/useProfileNav";
import { ProfileInfoSection } from "./sections/components/ProfileInfoSection";
import { OrdersSection } from "./pedidos/components/OrdersSection";
import { AddressesSection } from "./direcciones/components/AddressesSection";
import { BREADCRUMB_LABELS, PERFIL_NAV } from "./constants";
import type { ProfileSection } from "./sidebar/types";

function PerfilContent() {
  const { status } = useSession();

  const {
    profile,
    setProfile,
    loading,
    fetchError,
    toast,
    showToast,
    dismissToast,
    isSidebarOpen,
    openSidebar,
    toggleSidebar,
  } = useProfile();

  const { activeSection, setActiveSection } = useProfileNav();

  /* ── Loading ── */
  if (status === "loading" || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
      </div>
    );
  }

  /* ── Error ── */
  if (fetchError || (!loading && !profile)) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-800 font-semibold text-lg">Error al cargar el perfil</p>
          {fetchError && <p className="text-gray-500 text-sm mt-1">{fetchError}</p>}
          <button
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 bg-[#154734] text-white text-sm font-medium rounded-lg hover:bg-[#1a5c43] active:scale-95 transition-all"
          >
            Reintentar
          </button>
          <Link href="/" className="block mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Volver a la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-70 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top duration-300 ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
          <button onClick={dismissToast} className="ml-2 p-0.5 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        navItems={PERFIL_NAV.map((item) => ({
          id: item.id,
          label: item.label,
          description: item.description,
          icon: item.icon,
          isActive: activeSection === item.id,
          onClick: () => setActiveSection(item.id as ProfileSection),
        }))}
        brandSubtitle="Mi Cuenta"
        userName={profile?.name}
        userInitial={profile?.name?.charAt(0).toUpperCase() ?? "U"}
        userRole={profile?.role === "ADMIN" ? "Administrador" : "Cliente"}
        backLink={{ href: "/", label: "Volver a la tienda" }}
        extraLink={
          profile?.role === "ADMIN"
            ? { href: "/admin", label: "Panel Admin" }
            : undefined
        }
      />

      {/* Right side */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top bar */}
        <AppTopHeader
          onMenuOpen={isSidebarOpen ? toggleSidebar : openSidebar}
          breadcrumbRoot="Mi Cuenta"
          breadcrumbCurrent={BREADCRUMB_LABELS[activeSection]}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 bg-gray-50 scrollbar-hide">
          <div className="w-full">
            {activeSection === "perfil" && profile && (
              <ProfileInfoSection
                profile={profile}
                onProfileUpdate={setProfile}
                onToast={showToast}
              />
            )}
            {activeSection === "pedidos" && <OrdersSection />}
            {activeSection === "direcciones" && <AddressesSection />}
          </div>
        </main>
      </div>

    </div>
  );
}

export default function PerfilUsuario() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
        </div>
      }
    >
      <PerfilContent />
    </Suspense>
  );
}
