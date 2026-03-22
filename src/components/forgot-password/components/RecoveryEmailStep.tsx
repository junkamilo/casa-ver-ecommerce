"use client";

import { Mail } from "lucide-react";
import type { UseFormRegister, UseFormHandleSubmit, FieldErrors } from "react-hook-form";
import type { RecoveryEmailFormData } from "../types/types";
import AuthAlert from "@/components/ui/auth/AuthAlert";
import AuthFormHeader from "@/components/ui/auth/AuthFormHeader";
import SubmitButton from "@/components/ui/auth/SubmitButton";

interface RecoveryEmailStepProps {
  register:     UseFormRegister<RecoveryEmailFormData>;
  handleSubmit: UseFormHandleSubmit<RecoveryEmailFormData>;
  errors:       FieldErrors<RecoveryEmailFormData>;
  error:        string | null;
  success:      string | null;
  isLoading:    boolean;
  onSubmit:     (data: RecoveryEmailFormData) => Promise<void>;
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
      <AuthFormHeader
        icon={Mail}
        title="Recupera tu cuenta"
        subtitle="Ingresa el correo de recuperación que registraste al crear tu cuenta. Te enviaremos un código de verificación."
      />

      <AuthAlert message={error}   variant="error" />
      <AuthAlert message={success} variant="info" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        <SubmitButton isLoading={isLoading} label="Enviar código de verificación" icon={Mail} />
      </form>
    </div>
  );
}
