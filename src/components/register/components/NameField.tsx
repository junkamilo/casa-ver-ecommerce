import { User } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { RegisterFormData } from "../types/types";

interface NameFieldProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

const NameField = ({ register, errors }: NameFieldProps) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide ml-0.5">
      Nombre Completo
    </label>
    <div className="relative">
      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#154734]/50" />
      <input
        {...register("name")}
        type="text"
        placeholder="Tu nombre completo"
        className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/40 focus:border-[#C19A6B] focus:bg-white transition-all placeholder:text-gray-400"
      />
    </div>
    {errors.name && (
      <p className="text-xs text-red-500 ml-0.5">{errors.name.message}</p>
    )}
  </div>
);

export default NameField;
