"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { LoginFormData } from "../types";


interface PasswordFieldProps {
  register: UseFormRegister<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
}

const PasswordField = ({ register, errors }: PasswordFieldProps) => {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide ml-0.5">
        Contraseña
      </label>
      <div className="relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#154734]/50" />
        <input
          {...register("password")}
          type={show ? "text" : "password"}
          placeholder="••••••••"
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
      {errors.password && (
        <p className="text-xs text-red-500 ml-0.5">{errors.password.message}</p>
      )}

      {/* ¿Olvidaste tu contraseña? */}
      <div className="pt-1 flex justify-end">
        <Link
          href="/recuperar"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#C19A6B] hover:text-[#a67c52] underline underline-offset-2 transition-colors"
        >
          ¿Olvidaste tu contraseña?
        </Link>
      </div>
    </div>
  );
};

export default PasswordField;
