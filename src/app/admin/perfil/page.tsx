"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
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
  Edit3,
  Save,
  ShieldCheck,
  KeyRound,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
}

export default function AdminPerfil() {
  const { data: session } = useSession();

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
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
      })
      .catch(() => showToast("error", "Error al cargar perfil"))
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
        <p className="text-sm text-gray-500 font-medium">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">

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

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#154734]" style={{ fontFamily: "Georgia, serif" }}>
          Mi Perfil
        </h1>
        <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4" />
          Información personal y seguridad
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-br from-[#154734] to-[#1a5c43] p-8 flex flex-col items-center text-center">
            {profile?.image ? (
              <Image
                src={profile.image}
                alt={profile.name || ""}
                width={96}
                height={96}
                className="rounded-full border-4 border-white/30 shadow-lg mb-4"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#C19A6B] text-white flex items-center justify-center font-bold text-3xl border-4 border-white/30 shadow-lg mb-4">
                {profile?.name?.charAt(0).toUpperCase() || "A"}
              </div>
            )}
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
              {profile?.name || "Administrador"}
            </h2>
            <p className="text-white/60 text-sm mt-1">{profile?.email}</p>
            <span className="mt-3 text-xs bg-[#C19A6B] text-white px-4 py-1.5 rounded-full font-bold uppercase tracking-wider">
              Administrador
            </span>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-400 text-xs">Miembro desde</p>
                <p className="text-gray-700 font-medium">
                  {profile?.createdAt ? formatDate(profile.createdAt) : "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-gray-400 text-xs">Rol</p>
                <p className="text-gray-700 font-medium">Super Administrador</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">

          {/* Nombre */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}>
              <User className="w-5 h-5 text-[#154734]" />
              Información Personal
            </h3>

            <div className="space-y-5">
              {/* Name field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Nombre completo</label>
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
                    <span className="text-sm text-gray-900 font-medium">{profile?.name || "Sin nombre"}</span>
                    <button
                      onClick={() => setEditingName(true)}
                      className="text-[#154734] hover:bg-[#154734]/10 p-1.5 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-600">Correo electrónico</label>
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{profile?.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Password Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: "Georgia, serif" }}>
              <KeyRound className="w-5 h-5 text-[#154734]" />
              Seguridad
            </h3>

            {!showPasswordSection ? (
              <button
                onClick={() => setShowPasswordSection(true)}
                className="flex items-center gap-3 w-full bg-gray-50 hover:bg-gray-100 px-4 py-4 rounded-xl border border-gray-100 transition-colors group"
              >
                <div className="p-2 bg-[#154734]/10 rounded-lg text-[#154734] group-hover:bg-[#154734] group-hover:text-white transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">Cambiar contraseña</p>
                  <p className="text-xs text-gray-500">Actualiza tu contraseña de acceso</p>
                </div>
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-3">
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Contraseña actual"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nueva contraseña (mín. 6 caracteres)"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmar nueva contraseña"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-5 py-2.5 bg-[#154734] text-white rounded-lg text-sm font-bold hover:bg-[#103a2a] transition-colors disabled:opacity-50 flex items-center gap-2"
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
                    className="px-4 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
