import { Lock, Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import type { SecuritySectionProps } from "../types/types";

export default function SecuritySection({
  showPasswordSection,
  currentPassword,
  newPassword,
  confirmPassword,
  showCurrentPw,
  showNewPw,
  savingPassword,
  onOpen,
  onCancel,
  onSubmit,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onToggleCurrentPw,
  onToggleNewPw,
}: SecuritySectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <h3
        className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"
        style={{ fontFamily: "Georgia, serif" }}
      >
        <KeyRound className="w-5 h-5 text-[#154734]" />
        Seguridad
      </h3>

      {!showPasswordSection ? (
        <button
          onClick={onOpen}
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
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showCurrentPw ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => onCurrentPasswordChange(e.target.value)}
                placeholder="Contraseña actual"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none text-sm"
              />
              <button
                type="button"
                onClick={onToggleCurrentPw}
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
                onChange={(e) => onNewPasswordChange(e.target.value)}
                placeholder="Nueva contraseña (mín. 6 caracteres)"
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10 outline-none text-sm"
              />
              <button
                type="button"
                onClick={onToggleNewPw}
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
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
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
              {savingPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              Actualizar contraseña
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
