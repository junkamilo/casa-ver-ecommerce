import { Lock } from "lucide-react";
import Link from "next/link";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { LoginFormData } from "../types/types";

interface PasswordFieldProps {
  register: UseFormRegister<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
}

const PasswordField = ({ register, errors }: PasswordFieldProps) => (
  <div className="space-y-1.5 sm:space-y-2">
    <div className="flex justify-between items-center ml-1">
      <label className="text-xs sm:text-sm font-medium text-gray-700">
        Contraseña
      </label>
      <Link
        href="/recuperar"
        className="text-xs text-[#C19A6B] hover:underline font-medium"
      >
        ¿Olvidaste tu contraseña?
      </Link>
    </div>
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      <input
        {...register("password")}
        type="password"
        placeholder="••••••••"
        className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/50 focus:border-[#C19A6B] transition-all"
      />
    </div>
    {errors.password && (
      <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>
    )}
  </div>
);

export default PasswordField;
