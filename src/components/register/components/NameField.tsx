import { User } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { RegisterFormData } from "../types/types";

interface NameFieldProps {
  register: UseFormRegister<RegisterFormData>;
  errors: FieldErrors<RegisterFormData>;
}

const NameField = ({ register, errors }: NameFieldProps) => (
  <div className="space-y-1.5 sm:space-y-2">
    <label className="text-xs sm:text-sm font-medium text-gray-700 ml-1">
      Nombre Completo
    </label>
    <div className="relative">
      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      <input
        {...register("name")}
        type="text"
        placeholder="Tu nombre"
        className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C19A6B]/50 focus:border-[#C19A6B] transition-all"
      />
    </div>
    {errors.name && (
      <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>
    )}
  </div>
);

export default NameField;
