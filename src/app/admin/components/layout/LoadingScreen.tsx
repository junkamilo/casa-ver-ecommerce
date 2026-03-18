import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <Loader2 className="w-12 h-12 animate-spin text-[#154734]" />
      <p className="text-sm text-gray-500 font-medium animate-pulse">Cargando panel...</p>
    </div>
  );
}
