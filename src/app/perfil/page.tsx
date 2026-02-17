"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  User,
  Mail,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  ArrowLeft,
  Package,
  Edit3,
  Save,
  ShieldCheck,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
}

export default function PerfilUsuario() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit name
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Change password
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
        .then((data) => {
          setProfile(data);
          setName(data.name || "");
        })
        .catch(() => showToast("error", "Error al cargar perfil"))
        .finally(() => setLoading(false));
    }
  }, [status]);

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.message);
        return;
      }
      setProfile(data);
      setEditingName(false);
      showToast("success", "Nombre actualizado");
    } catch {
      showToast("error", "Error de conexión");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("error", "Las contraseñas no coinciden");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("error", data.message);
        return;
      }
      showToast("success", "Contraseña actualizada correctamente");
      setShowPasswordSection(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      showToast("error", "Error de conexión");
    } finally {
      setSavingPassword(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const isGoogleUser = !profile?.createdAt ? false : !session?.user?.email;

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
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Toast */}
          {toast && (
            <div className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top duration-300 ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"
            }`}>
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

          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#154734] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la tienda
          </Link>

          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-[#154734] to-[#1a5c43] p-6 sm:p-8">
              <div className="flex items-center gap-4">
                {profile?.image ? (
                  <Image
                    src={profile.image}
                    alt={profile.name || ""}
                    width={72}
                    height={72}
                    className="rounded-full border-4 border-white/30 shadow-lg"
                  />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-full bg-[#C19A6B] text-white flex items-center justify-center font-bold text-2xl border-4 border-white/30 shadow-lg">
                    {profile?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="text-white">
                  <h1 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
                    {profile?.name || "Usuario"}
                  </h1>
                  <p className="text-white/70 text-sm flex items-center gap-2 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    {profile?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                      {profile?.role === "ADMIN" ? (
                        <><ShieldCheck className="w-3 h-3" /> Administrador</>
                      ) : (
                        <><User className="w-3 h-3" /> Cliente</>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="p-6 space-y-6">

              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Nombre
                </label>
                {editingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none text-sm"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName || !name.trim()}
                      className="px-4 py-2.5 bg-[#154734] text-white rounded-lg text-sm font-medium hover:bg-[#103a2a] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Guardar
                    </button>
                    <button
                      onClick={() => { setEditingName(false); setName(profile?.name || ""); }}
                      className="px-3 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                    <span className="text-sm text-gray-900">{profile?.name || "Sin nombre"}</span>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-[#154734] hover:bg-[#154734]/10 p-1.5 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Correo electrónico
                </label>
                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                  <span className="text-sm text-gray-600">{profile?.email}</span>
                </div>
              </div>

              {/* Fecha registro */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Miembro desde
                </label>
                <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                  <span className="text-sm text-gray-600">
                    {profile?.createdAt ? formatDate(profile.createdAt) : "—"}
                  </span>
                </div>
              </div>

              {/* Cambiar contraseña */}
              <div className="pt-4 border-t border-gray-100">
                {!showPasswordSection ? (
                  <button
                    onClick={() => setShowPasswordSection(true)}
                    className="flex items-center gap-2 text-sm font-medium text-[#154734] hover:underline"
                  >
                    <Lock className="w-4 h-4" />
                    Cambiar contraseña
                  </button>
                ) : (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      Cambiar contraseña
                    </h3>

                    <div className="space-y-3">
                      <div className="relative">
                        <input
                          type={showCurrentPw ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Contraseña actual"
                          required
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type={showNewPw ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Nueva contraseña (mín. 6 caracteres)"
                          required
                          minLength={6}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none text-sm pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirmar nueva contraseña"
                        required
                        minLength={6}
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none text-sm"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={savingPassword}
                        className="px-5 py-2.5 bg-[#154734] text-white rounded-lg text-sm font-medium hover:bg-[#103a2a] transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Actualizar contraseña
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordSection(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                        className="px-4 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/pedidos"
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#C19A6B] transition-all shadow-sm flex items-center gap-4 group"
            >
              <div className="p-3 bg-[#154734]/10 rounded-xl text-[#154734] group-hover:bg-[#154734] group-hover:text-white transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Mis Pedidos</h3>
                <p className="text-xs text-gray-500">Ver historial de compras</p>
              </div>
            </Link>

            {profile?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#C19A6B] transition-all shadow-sm flex items-center gap-4 group"
              >
                <div className="p-3 bg-[#C19A6B]/10 rounded-xl text-[#C19A6B] group-hover:bg-[#C19A6B] group-hover:text-white transition-colors">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Panel Admin</h3>
                  <p className="text-xs text-gray-500">Gestionar la tienda</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
