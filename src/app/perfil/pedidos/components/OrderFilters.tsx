import { OrderFilter } from "../types";
import { ORDER_FILTER_LABELS, VISIBLE_FILTERS } from "../constants";

interface Props {
  active: OrderFilter;
  onChange: (filter: OrderFilter) => void;
  countByStatus: Record<string, number>;
}

export function OrderFilters({ active, onChange, countByStatus }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {VISIBLE_FILTERS.map((filter) => {
        const count = countByStatus[filter];
        if (!count && filter !== "ALL") return null;

        const isActive = active === filter;

        return (
          <button
            key={filter}
            onClick={() => onChange(filter)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              isActive
                ? "bg-[#154734] text-white border-[#154734]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[#154734]/50"
            }`}
          >
            {ORDER_FILTER_LABELS[filter]}
            {count !== undefined && (
              <span
                className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  isActive ? "bg-white/20" : "bg-gray-100 text-gray-500"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
