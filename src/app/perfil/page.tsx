"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Footer from "@/components/Footer";
import Header from "@/components/layout/Header";
import { Loader2, CheckCircle, AlertCircle, X, ArrowLeft } from "lucide-react";

import { UserProfile } from "./types";
import { useProfileNav } from "./sidebar/hooks/useProfileNav";
import { ProfileSidebar } from "./sidebar/components/ProfileSidebar";
import { ProfileInfoSection } from "./sections/ProfileInfoSection";
import { OrdersSection } from "./pedidos/components/OrdersSection";

export default function PerfilUsuario() {
  const { status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const { activeSection, setActiveSection } = useProfileNav();

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => setProfile(data))
        .catch(() => showToast("error", "Error al cargar perfil"))
        .finally(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Toast */}
          {toast && (
            <div
              className={`fixed top-4 right-4 z-60 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top duration-300 ${
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
              <button
                onClick={() => setToast(null)}
                className="ml-2 p-0.5 hover:bg-black/5 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile back link */}
          <Link
            href="/"
            className="lg:hidden inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#154734] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>

          {/* Layout grid */}
          <div className="flex flex-col lg:grid lg:grid-cols-[260px_1fr] lg:items-start gap-5">

            {/* Sidebar */}
            {profile && (
              <ProfileSidebar
                user={profile}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                isAdmin={profile.role === "ADMIN"}
              />
            )}

            {/* Main content */}
            <div className="min-w-0">
              {activeSection === "perfil" && profile && (
                <ProfileInfoSection
                  profile={profile}
                  onProfileUpdate={setProfile}
                  onToast={showToast}
                />
              )}
              {activeSection === "pedidos" && <OrdersSection />}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
