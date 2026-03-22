"use client";

import { Mail, Loader2, KeyRound } from "lucide-react";
import type { UseFormRegister, UseFormHandleSubmit, FieldErrors } from "react-hook-form";
import type { RecoveryEmailFormData } from "../types/types";

interface RecoveryEmailStepProps {
  register: UseFormRegister<RecoveryEmailFormData>;
  handleSubmit: UseFormHandleSubmit<RecoveryEmailFormData>;
  errors: FieldErrors<RecoveryEmailFormData>;
  error: string | null;
  success: string | null;
  isLoading: boolean;
  onSubmit: (data: RecoveryEmailFormData) => Promise<void>;
}

export default function RecoveryEmailStep({
  register,
  handleSubmit,
  errors,
  error,
  success,
  isLoading,
  onSubmit,
}: RecoveryEmailStepProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Encabezado */}
      <div className="mb-7">
        <div className="w-14 h-14 rounded-full bg-[#154734]/10 flex items-center justify-center mb-4">
          <KeyRound className="w-7 h-7 text-[#154734]" />
        </div>
        <h2
          className="text-2xl sm:text-3xl font-bold text-[#154734] mb-1.5"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Recupera tu cuenta
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Ingresa el correo de recuperación que registraste al crear tu cuenta. Te enviaremos un código de verificación.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-2 rounded text-xs sm:text-sm animate-in fade-in">
          <span className="mt-0.5 shrink-0">⚠</span>
          <p>{error}</p>
        </div>
      )}

      {/* Éxito (recoveryEmail no encontrado pero mostramos genérico) */}
      {success && (
        <div className="mb-5 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 flex items-start gap-2 rounded text-xs sm:text-sm animate-in fade-in">
          <span className="mt-0.5 shrink-0">ℹ</span>
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Campo correo de recuperación */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide ml-0.5">
            Correo de recuperación
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#154734]/50" />
            <input
              {...register("recoveryEmail")}
              type="email"
              placeholder="tu@correo-recuperacion.com"
              className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/40 focus:border-[#C19A6B] focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>
          {errors.recoveryEmail && (
            <p className="text-xs text-red-500 ml-0.5">{errors.recoveryEmail.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#154734] hover:bg-[#0f3829] disabled:opacity-70 text-white font-semibold py-3.5 text-sm rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Mail className="w-4 h-4" />
              Enviar código de verificación
            </>
          )}
        </button>
      </form>
    </div>
  );
}
