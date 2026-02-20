"use client";

import { useState } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Save,
  Edit3,
  ShieldCheck,
} from "lucide-react";
import { UserProfile } from "../types";

interface Props {
  profile: UserProfile;
  onProfileUpdate: (updated: UserProfile) => void;
  onToast: (type: "success" | "error", message: string) => void;
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export function ProfileInfoSection({ profile, onProfileUpdate, onToast }: Props) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(profile.name ?? "");
  const [savingName, setSavingName] = useState(false);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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
        onToast("error", data.message);
        return;
      }
      onProfileUpdate(data);
      setEditingName(false);
      onToast("success", "Nombre actualizado");
    } catch {
      onToast("error", "Error de conexión");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onToast("error", "Las contraseñas no coinciden");
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
        onToast("error", data.message);
        return;
      }
      onToast("success", "Contraseña actualizada correctamente");
      setShowPasswordSection(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      onToast("error", "Error de conexión");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#154734] to-[#1a5c43] p-6 sm:p-8">
        <div className="flex items-center gap-4">
          {profile.image ? (
            <Image
              src={profile.image}
              alt={profile.name ?? ""}
              width={72}
              height={72}
              className="rounded-full border-4 border-white/30 shadow-lg"
            />
          ) : (
            <div className="w-[72px] h-[72px] rounded-full bg-[#C19A6B] text-white flex items-center justify-center font-bold text-2xl border-4 border-white/30 shadow-lg">
              {profile.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
          )}
          <div className="text-white">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Georgia, serif" }}>
              {profile.name ?? "Usuario"}
            </h1>
            <p className="text-white/70 text-sm flex items-center gap-2 mt-1">
              <Mail className="w-3.5 h-3.5" />
              {profile.email}
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs bg-white/20 text-white px-3 py-1 rounded-full font-medium">
              {profile.role === "ADMIN" ? (
                <>
                  <ShieldCheck className="w-3 h-3" /> Administrador
                </>
              ) : (
                <>
                  <User className="w-3 h-3" /> Cliente
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Fields */}
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
                {savingName ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Guardar
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setName(profile.name ?? "");
                }}
                className="px-3 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
              <span className="text-sm text-gray-900">{profile.name ?? "Sin nombre"}</span>
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
            <span className="text-sm text-gray-600">{profile.email}</span>
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
              {profile.createdAt ? formatDate(profile.createdAt) : "—"}
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
                    {showCurrentPw ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
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
                  {savingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
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
  );
}
