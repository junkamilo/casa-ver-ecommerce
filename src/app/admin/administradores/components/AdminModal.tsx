import Image from "next/image";
import {
  X, Crown, Mail, User, Lock, Eye, EyeOff, Loader2,
  AlertCircle, CheckCircle, ShieldCheck, Copy, UserPlus,
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
  lookingUp: boolean;
  lookupDone: boolean;
  isExistingUser: boolean;
  isAlreadyAdmin: boolean;
  onGeneratePassword: () => void;
  onCopyPassword: () => void;
}

const AdminModal = ({
  isOpen, onClose, submitting, onSubmit,
  name, setName, email, setEmail, password, setPassword,
  showPassword, setShowPassword,
  lookupResult, lookingUp, lookupDone,
  isExistingUser, isAlreadyAdmin,
  onGeneratePassword, onCopyPassword,
}: AdminModalProps) => {
  if (!isOpen) return null;

  // Correo válido según regex básica
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Usuario nuevo confirmado por lookup
  const isNewUser = lookupDone && lookupResult?.exists === false;

  // Esperando resultado (email válido, debounce en curso o fetch activo)
  const isVerifying = emailIsValid && (!lookupDone || lookingUp);

  // ¿Puede enviar el formulario?
  const canSubmit =
    !submitting &&
    !lookingUp &&
    lookupDone &&
    !isAlreadyAdmin &&
    (isExistingUser || (isNewUser && name.trim() !== "" && password.length >= 6));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* ── Header ── */}
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

        {/* ── Formulario ── */}
        <form id="create-admin-form" onSubmit={onSubmit} className="p-6 overflow-y-auto space-y-5">

          {/* Info box */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <div className="p-2 bg-blue-100 rounded-lg h-fit shrink-0">
              <Crown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-800 mb-1">Acceso de Super Usuario</h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                Ingresa el correo del usuario. Si ya está registrado será{" "}
                <strong>ascendido automáticamente</strong>. Si no existe, se creará una cuenta nueva.
              </p>
            </div>
          </div>

          {/* ── Campo Email ── */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
                autoComplete="off"
                className={`w-full pl-10 pr-10 py-2.5 rounded-lg border outline-none transition-all text-sm ${
                  isAlreadyAdmin
                    ? "border-amber-300 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                    : isExistingUser
                    ? "border-emerald-300 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                    : isNewUser
                    ? "border-blue-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    : "border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10"
                }`}
              />
              {/* Ícono de estado en el campo */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {lookingUp ? (
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                ) : isExistingUser ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : isAlreadyAdmin ? (
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                ) : isNewUser ? (
                  <UserPlus className="w-4 h-4 text-blue-500" />
                ) : null}
              </div>
            </div>

            {/* Mensaje de estado bajo el campo */}
            {isVerifying && !lookingUp && (
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Verificando en la base de datos…
              </p>
            )}
            {lookingUp && (
              <p className="text-xs text-[#154734]/70 flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Buscando usuario…
              </p>
            )}
          </div>

          {/* ── Camino 1: Usuario existente → solo confirmar ── */}
          {isExistingUser && lookupResult?.user && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
              <div className="relative w-11 h-11 rounded-full bg-emerald-100 border-2 border-emerald-200 overflow-hidden flex items-center justify-center shrink-0">
                {lookupResult.user.image ? (
                  <Image
                    src={lookupResult.user.image}
                    alt={lookupResult.user.name || ""}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="font-bold text-emerald-700 text-base">
                    {lookupResult.user.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-emerald-800 truncate">
                  {lookupResult.user.name || "Sin nombre"}
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Usuario registrado · Se promoverá a Administrador
                </p>
              </div>
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            </div>
          )}

          {/* ── Ya es admin ── */}
          {isAlreadyAdmin && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Este usuario ya es administrador
                </p>
                <p className="text-xs text-amber-600 mt-0.5">
                  No es necesario realizar ninguna acción.
                </p>
              </div>
            </div>
          )}

          {/* ── Camino 2: Usuario nuevo → completar datos ── */}
          {isNewUser && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Aviso de usuario nuevo */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-500 shrink-0" />
                <p className="text-xs text-blue-700">
                  Correo no registrado — completa los datos para crear la cuenta admin.
                </p>
              </div>

              {/* Nombre */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Ana María Pérez"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">
                    Contraseña de Acceso
                  </label>
                  <button
                    type="button"
                    onClick={onGeneratePassword}
                    className="text-xs font-bold text-[#154734] hover:text-[#C19A6B] transition-colors"
                  >
                    Generar segura
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none transition-all text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password && (
                  <button
                    type="button"
                    onClick={onCopyPassword}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#C19A6B] transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    Copiar al portapapeles
                  </button>
                )}
              </div>
            </div>
          )}
        </form>

        {/* ── Footer ── */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="create-admin-form"
            disabled={!canSubmit}
            className="px-6 py-2.5 text-sm font-bold text-white bg-[#154734] hover:bg-[#103a2a] rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Procesando…
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
