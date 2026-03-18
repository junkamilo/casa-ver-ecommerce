import Link from "next/link";
import { Plus } from "lucide-react";

export default function DashboardError() {
  return (
    <div className="space-y-4 p-4 sm:p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1
          className="text-2xl font-bold text-[#154734]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Panel de Control
        </h1>
        <Link
          href="/admin/productos?action=new"
          className="inline-flex items-center gap-2 bg-[#154734] text-white px-4 py-2.5 rounded-full font-medium text-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Link>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <h3 className="text-sm font-bold text-red-900 mb-1">Error al cargar métricas</h3>
        <p className="text-xs text-red-700">
          Hubo un problema al conectar con la base de datos. Por favor, intenta recargar la página.
        </p>
      </div>
    </div>
  );
}
