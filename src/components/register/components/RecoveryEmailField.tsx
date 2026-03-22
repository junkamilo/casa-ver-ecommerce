"use client";

import { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import type { UseFormRegister, UseFormSetValue, FieldErrors } from "react-hook-form";
import type { RegisterFormData } from "../types/types";

interface RecoveryEmailFieldProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
  emailValue: string;
  setValue: UseFormSetValue<RegisterFormData>;
}

const RecoveryEmailField = ({ register, errors, emailValue, setValue }: RecoveryEmailFieldProps) => {
  const [useSameEmail, setUseSameEmail] = useState(false);

  useEffect(() => {
    if (useSameEmail) {
      setValue("recoveryEmail", emailValue, { shouldValidate: true });
    }
  }, [useSameEmail, emailValue, setValue]);

  const handleCheckbox = (checked: boolean) => {
    setUseSameEmail(checked);
    if (checked) {
      setValue("recoveryEmail", emailValue, { shouldValidate: true });
    } else {
      setValue("recoveryEmail", "", { shouldValidate: false });
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between ml-0.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Correo de Recuperación
        </label>
        <span className="text-[10px] text-gray-400 font-medium">Opcional</span>
      </div>

      <p className="text-xs text-gray-400 ml-0.5 leading-snug">
        En caso de que olvides tu contraseña, ingresa un correo electrónico de recuperación.
      </p>

      {/* Checkbox usar mismo correo */}
      <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
        <div className="relative flex items-center justify-center">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={useSameEmail}
            onChange={(e) => handleCheckbox(e.target.checked)}
          />
          <div className="w-4 h-4 rounded border border-gray-300 bg-gray-50 peer-checked:bg-[#154734] peer-checked:border-[#154734] transition-all flex items-center justify-center">
            {useSameEmail && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500 group-hover:text-[#154734] transition-colors leading-snug">
          Usar el mismo correo ingresado anteriormente
        </span>
      </label>

      {/* Input */}
      <div className="relative">
        <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#154734]/50" />
        <input
          {...register("recoveryEmail")}
          type="email"
          placeholder="correo.alternativo@email.com"
          disabled={useSameEmail}
          className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/40 focus:border-[#C19A6B] focus:bg-white transition-all placeholder:text-gray-400 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-100"
        />
      </div>

      {errors.recoveryEmail && (
        <p className="text-xs text-red-500 ml-0.5">{errors.recoveryEmail.message}</p>
      )}
    </div>
  );
};

export default RecoveryEmailField;
