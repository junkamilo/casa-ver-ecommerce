import { Mail } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { LoginFormData } from "../types";


interface EmailFieldProps {
  register: UseFormRegister<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
}

const EmailField = ({ register, errors }: EmailFieldProps) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide ml-0.5">
      Correo Electrónico
    </label>
    <div className="relative">
      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#154734]/50" />
      <input
        {...register("email")}
        type="email"
        placeholder="tu@correo.com"
        className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/40 focus:border-[#C19A6B] focus:bg-white transition-all placeholder:text-gray-400"
      />
    </div>
    {errors.email && (
      <p className="text-xs text-red-500 ml-0.5">{errors.email.message}</p>
    )}
  </div>
);

export default EmailField;
