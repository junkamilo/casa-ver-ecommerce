import { Check, AlertCircle } from "lucide-react";
import type { CategoryToastProps } from "../types/types";

const CategoryToast = ({ toast }: CategoryToastProps) => {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-8 duration-500 ${
        toast.type === "success"
          ? "bg-[#154734] text-white"
          : "bg-red-600 text-white"
      }`}
    >
      <div className="bg-white/20 rounded-full p-2 backdrop-blur-sm">
        {toast.type === "success" ? (
          <Check className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-white/70 mb-0.5">
          {toast.type === "success" ? "Éxito" : "Alerta"}
        </p>
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    </div>
  );
};

export default CategoryToast;
