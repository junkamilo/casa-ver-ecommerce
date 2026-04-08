"use client";

import { Suspense, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, AlertCircle, X, User, Package, MapPin } from "lucide-react";
import AppTopHeader from "@/components/layout/AppTopHeader";

import AppSidebar from "@/components/layout/AppSidebar";
import { UserProfile } from "./types";
import { useProfileNav } from "./sidebar/hooks/useProfileNav";
import { ProfileInfoSection } from "./sections/ProfileInfoSection";
import { OrdersSection } from "./pedidos/components/OrdersSection";
import { AddressesSection } from "./direcciones/components/AddressesSection";
import { ProfileSection } from "./sidebar/types";


const PERFIL_NAV = [
  { id: "perfil" as ProfileSection,      label: "Mi Perfil",       description: "Información personal",  icon: User    },
  { id: "pedidos" as ProfileSection,     label: "Mis Pedidos",     description: "Historial de compras",   icon: Package },
  { id: "direcciones" as ProfileSection, label: "Mis Direcciones", description: "Direcciones de envío",   icon: MapPin  },
];

function PerfilContent() {
  const { status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { activeSection, setActiveSection } = useProfileNav();

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      setFetchError(null);
      fetch("/api/profile")
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.message || `Error ${res.status}`);
          }
          return res.json();
        })
        .then((data) => setProfile(data))
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : "Error al cargar el perfil";
          setFetchError(msg);
        })
        .finally(() => setLoading(false));
    }
  }, [status]);

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

  const userInitial = profile?.name?.charAt(0).toUpperCase() ?? "U";
  const userRole = profile?.role === "ADMIN" ? "Administrador" : "Cliente";

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
          <button onClick={() => setToast(null)} className="ml-2 p-0.5 hover:bg-black/5 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <AppSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        navItems={PERFIL_NAV.map((item) => ({
          id: item.id,
          label: item.label,
          description: item.description,
          icon: item.icon,
          isActive: activeSection === item.id,
          onClick: () => setActiveSection(item.id),
        }))}
        brandSubtitle="Mi Cuenta"
        userName={profile?.name}
        userInitial={userInitial}
        userRole={userRole}
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
          onMenuOpen={() => setIsSidebarOpen(true)}
          breadcrumbRoot="Mi Cuenta"
          breadcrumbCurrent={
            activeSection === "perfil" ? "Mi Perfil"
            : activeSection === "pedidos" ? "Mis Pedidos"
            : "Mis Direcciones"
          }
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
