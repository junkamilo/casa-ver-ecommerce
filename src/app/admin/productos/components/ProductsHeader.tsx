import { Plus, Package } from "lucide-react";

interface Props {
  onNew: () => void;
}

export default function ProductsHeader({ onNew }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1
          className="text-3xl font-bold text-[#154734]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Inventario
        </h1>
        <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
          <Package className="w-4 h-4" />
          Gestión completa de catálogo
        </p>
      </div>
      <button
        onClick={onNew}
        className="inline-flex items-center justify-center gap-2 bg-[#154734] hover:bg-[#0f3626] text-white px-6 py-3 rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95 font-medium"
      >
        <Plus className="w-5 h-5" />
        Nuevo Producto
      </button>
    </div>
  );
}
