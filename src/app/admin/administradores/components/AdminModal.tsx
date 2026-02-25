import Image from "next/image";
import {
  X, Crown, Mail, User, Lock, Eye, EyeOff, Loader2,
  AlertCircle, CheckCircle, ShieldCheck, Copy
} from "lucide-react";
import type { LookupResult } from "../types/types";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  name: string;
  setName: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  lookupResult: LookupResult | null;
  setLookupResult: (v: LookupResult | null) => void;
  lookingUp: boolean;
  isExistingUser: boolean;
  isAlreadyAdmin: boolean;
  onLookupEmail: (email: string) => void;
  onGeneratePassword: () => void;
  onCopyPassword: () => void;
}

const AdminModal = ({
  isOpen, onClose, submitting, onSubmit,
  name, setName, email, setEmail, password, setPassword,
  showPassword, setShowPassword,
  lookupResult, setLookupResult, lookingUp,
  isExistingUser, isAlreadyAdmin,
  onLookupEmail, onGeneratePassword, onCopyPassword,
}: AdminModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2
              className="text-xl font-bold text-[#154734]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Nuevo Administrador
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Otorga permisos de acceso completo al panel
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form
          id="create-admin-form"
          onSubmit={onSubmit}
          className="p-6 overflow-y-auto space-y-6"
        >
          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <div className="p-2 bg-blue-100 rounded-lg h-fit">
              <Crown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-800 mb-1">Acceso de Super Usuario</h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                Ingresa el correo del usuario. Si ya está registrado, será{" "}
                <strong>ascendido automáticamente</strong>. Si no existe, se creará una cuenta nueva.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Correo del Usuario</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (lookupResult) setLookupResult(null);
                  }}
                  onBlur={() => onLookupEmail(email)}
                  placeholder="admin@casaverde.com"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-sm"
                />
                {lookingUp && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                )}
              </div>
            </div>

            {/* Usuario encontrado */}
            {isExistingUser && lookupResult?.user && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
                <div className="relative w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 overflow-hidden flex items-center justify-center shrink-0">
                  {lookupResult.user.image ? (
                    <Image
                      src={lookupResult.user.image}
                      alt={lookupResult.user.name || ""}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-bold text-emerald-700">
                      {lookupResult.user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-800">
                    {lookupResult.user.name || "Sin nombre"}
                  </p>
                  <p className="text-xs text-emerald-600">
                    Usuario registrado — solo se necesita confirmar la promoción
                  </p>
                </div>
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
              </div>
            )}

            {/* Ya es admin */}
            {isAlreadyAdmin && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm font-medium text-amber-800">
                  Este usuario ya es administrador
                </p>
              </div>
            )}

            {/* Nombre — solo para usuarios nuevos */}
            {!isExistingUser && !isAlreadyAdmin && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Ana María Pérez"
                    required={!isExistingUser}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            )}

            {/* Contraseña — solo para usuarios nuevos */}
            {!isExistingUser && !isAlreadyAdmin && (
              <div className="pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Contraseña de Acceso
                  </label>
                  <button
                    type="button"
                    onClick={onGeneratePassword}
                    className="text-xs font-bold text-[#154734] hover:underline"
                  >
                    Generar Segura
                  </button>
                </div>
                <div className="relative flex-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required={!isExistingUser}
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={onCopyPassword}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#C19A6B] transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Copiar al portapapeles
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-admin-form"
            disabled={
              submitting ||
              !email ||
              isAlreadyAdmin ||
              (!isExistingUser && (!name || !password))
            }
            className="px-6 py-2.5 text-sm font-bold text-white bg-[#154734] hover:bg-[#103a2a] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                {isExistingUser ? "Promover a Admin" : "Crear Admin"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
