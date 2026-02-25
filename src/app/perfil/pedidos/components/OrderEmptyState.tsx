import { ShoppingBag } from "lucide-react";

interface Props {
  hasActiveFilter: boolean;
}

export function OrderEmptyState({ hasActiveFilter }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        <ShoppingBag className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-sm font-semibold text-gray-700">
        {hasActiveFilter ? "Sin pedidos en este estado" : "Aún no tienes pedidos"}
      </p>
      <p className="text-xs text-gray-400 mt-1">
        {hasActiveFilter
          ? "Prueba con otro filtro para ver tus pedidos"
          : "Cuando realices una compra aparecerá aquí"}
      </p>
    </div>
  );
}
