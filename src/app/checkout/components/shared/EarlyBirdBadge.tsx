import { Star } from "lucide-react";

interface EarlyBirdBadgeProps {
  /** compact=true → tamaños reducidos para el panel mobile */
  compact?: boolean;
}

/**
 * Badge Early Bird reutilizable para desktop y mobile summary panels.
 */
export default function EarlyBirdBadge({ compact = false }: EarlyBirdBadgeProps) {
  return (
    <div
      className={`flex items-center bg-amber-50 border border-amber-200 rounded-2xl ${
        compact ? "gap-2.5 px-4 py-3" : "gap-3 px-5 py-3.5 mb-6"
      }`}
    >
      <Star className="w-4 h-4 text-amber-500 shrink-0 fill-amber-400" />
      <div>
        <p
          className={`font-black text-amber-700 uppercase tracking-widest ${
            compact ? "text-[10px]" : "text-xs"
          }`}
        >
          Early Bird · 10% de descuento
        </p>
        <p className={`text-amber-600 ${compact ? "text-[9px]" : "text-[11px]"}`}>
          {compact
            ? "Eres uno de los primeros 10 clientes"
            : "Eres uno de los primeros 10 clientes de Casa Verde"}
        </p>
      </div>
    </div>
  );
}
