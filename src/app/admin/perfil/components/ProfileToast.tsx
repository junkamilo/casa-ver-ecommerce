import { CheckCircle, AlertCircle, X } from "lucide-react";
import type { ProfileToastProps } from "../types/types";

export default function ProfileToast({ toast, onClose }: ProfileToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-60 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top duration-300 ${
        toast.type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
      )}
      <p className="text-sm font-medium">{toast.message}</p>
      <button onClick={onClose} className="ml-2 p-0.5 hover:bg-black/5 rounded">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
