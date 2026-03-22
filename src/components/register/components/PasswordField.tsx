"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { RegisterFormData } from "../types/types";

interface PasswordFieldProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

const rules = [
  { label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
  { label: "Una letra mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Una letra minúscula", test: (v: string) => /[a-z]/.test(v) },
  { label: "Un número",           test: (v: string) => /[0-9]/.test(v) },
  { label: "Un carácter especial (@$!%*?&._-#)", test: (v: string) => /[@$!%*?&._\-#^()+=]/.test(v) },
];

const PasswordField = ({ register, errors }: PasswordFieldProps) => {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState("");

  const { onChange, ...rest } = register("password");

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide ml-0.5">
        Contraseña
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#154734]/50" />
        <input
          {...rest}
          type={show ? "text" : "password"}
          placeholder="Mínimo 8 caracteres"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onChange(e);
          }}
          className="w-full pl-10 pr-11 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/40 focus:border-[#C19A6B] focus:bg-white transition-all placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#154734] transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Indicadores de requisitos (visibles mientras escribe) */}
      {value.length > 0 && (
        <ul className="mt-2 space-y-1 px-0.5">
          {rules.map((rule) => {
            const ok = rule.test(value);
            return (
              <li key={rule.label} className="flex items-center gap-1.5">
                <span className={`flex-shrink-0 w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${ok ? "bg-[#154734]" : "bg-gray-200"}`}>
                  <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 10 10">
                    <path d="M2 5l2.5 2.5 3.5-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className={`text-[11px] transition-colors ${ok ? "text-[#154734] font-medium" : "text-gray-400"}`}>
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
  );
};

export default PasswordField;
