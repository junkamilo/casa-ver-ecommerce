import { Download, Receipt } from "lucide-react";

export function PedidosHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-[#154734]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Pedidos
        </h1>
        <p className="text-gray-500 mt-1 flex items-center gap-2 text-xs sm:text-sm">
          <Receipt className="w-4 h-4" />
          Gestión y seguimiento de ventas
        </p>
      </div>
      <button className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-gray-50 hover:border-[#C19A6B] transition-all text-sm font-medium shadow-sm self-start sm:self-auto">
        <Download className="w-4 h-4 text-[#C19A6B]" />
        Exportar Reporte
      </button>
    </div>
  );
}
