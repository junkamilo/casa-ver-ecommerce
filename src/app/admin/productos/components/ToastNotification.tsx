import { CheckCircle, AlertCircle } from "lucide-react";
import { ToastState } from "../types";

interface Props {
  toast: ToastState;
}

export default function ToastNotification({ toast }: Props) {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-top duration-300 ${
        toast.type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {toast.type === "success" ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <AlertCircle className="w-5 h-5" />
      )}
      <p className="text-sm font-medium">{toast.message}</p>
    </div>
  );
}
