import { MapPin, Plus } from "lucide-react";

interface Props {
  onAdd: () => void;
}

export function AddressEmptyState({ onAdd }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-[#154734]/10 flex items-center justify-center mb-4">
        <MapPin className="w-8 h-8 text-[#154734]/40" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">
        Sin direcciones guardadas
      </h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        Agrega una dirección para agilizar tus próximas compras
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#154734] text-white text-sm font-medium rounded-xl hover:bg-[#1a5c43] active:scale-95 transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        Agregar dirección
      </button>
    </div>
  );
}
