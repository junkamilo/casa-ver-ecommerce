"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import type { NewPasswordStepProps } from "../types";
import { PASSWORD_RULES } from "../constants";
import AuthAlert from "@/components/ui/auth/AuthAlert";
import AuthFormHeader from "@/components/ui/auth/AuthFormHeader";
import SubmitButton from "@/components/ui/auth/SubmitButton";

export default function NewPasswordStep({
  register,
  handleSubmit,
  errors,
  error,
  isLoading,
  onSubmit,
}: NewPasswordStepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const { onChange: onChangePwd, ...restPwd } = register("password");

  return (
    <div className="w-full max-w-md mx-auto">
      <AuthFormHeader
        icon={ShieldCheck}
        title="Nueva contraseña"
        subtitle="Crea una contraseña segura para tu cuenta."
      />

      <AuthAlert message={error} variant="error" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">

        {/* Nueva contraseña */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide ml-0.5">
            Nueva contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#154734]/50" />
            <input
              {...restPwd}
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={passwordValue}
              onChange={(e) => {
                setPasswordValue(e.target.value);
                onChangePwd(e);
              }}
              className="w-full pl-10 pr-11 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/40 focus:border-[#C19A6B] focus:bg-white transition-all placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#154734] transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Indicadores de requisitos */}
          {passwordValue.length > 0 && (
            <ul className="mt-2 space-y-1 px-0.5">
              {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(passwordValue);
                return (
                  <li key={rule.label} className="flex items-center gap-1.5">
                    <span
                      className={`shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                        ok ? "bg-[#154734]" : "bg-gray-200"
                      }`}
                    >
                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 10 10">
                        <path
                          d="M2 5l2.5 2.5 3.5-4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span
                      className={`text-[11px] transition-colors ${
                        ok ? "text-[#154734] font-medium" : "text-gray-400"
                      }`}
                    >
                      {rule.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {errors.password && (
            <p className="text-xs text-red-500 ml-0.5">{errors.password.message}</p>
          )}
        </div>

        {/* Confirmar contraseña */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide ml-0.5">
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#154734]/50" />
            <input
              {...register("confirmPassword")}
              type={showConfirm ? "text" : "password"}
              placeholder="Repite tu contraseña"
              className="w-full pl-10 pr-11 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/40 focus:border-[#C19A6B] focus:bg-white transition-all placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#154734] transition-colors"
              tabIndex={-1}
              aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 ml-0.5">{errors.confirmPassword.message}</p>
          )}
        </div>

        <SubmitButton isLoading={isLoading} label="Guardar nueva contraseña" icon={ShieldCheck} />
      </form>
    </div>
  );
}
