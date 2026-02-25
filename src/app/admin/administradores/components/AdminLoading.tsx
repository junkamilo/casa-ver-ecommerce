import { Loader2 } from "lucide-react";

const AdminLoading = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-4">
    <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
    <p className="text-sm text-gray-500 font-medium">Cargando equipo...</p>
  </div>
);

export default AdminLoading;
