import { OrderFiltersProps } from "../types";
import { ORDER_FILTER_LABELS, VISIBLE_FILTERS } from "../constants";

export function OrderFilters({ active, onChange, countByStatus }: OrderFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {VISIBLE_FILTERS.map((filter) => {
        const count = countByStatus[filter] ?? 0;
        const isActive = active === filter;

        return (
          <button
            key={filter}
            onClick={() => onChange(filter)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              isActive
                ? "bg-[color:var(--theme-primary)] text-[color:var(--theme-primary-fg)] border-[color:var(--theme-primary)]"
                : "bg-white text-gray-600 border-gray-200 hover:border-[color:var(--theme-primary)]/50"
            }`}
          >
            {ORDER_FILTER_LABELS[filter]}
            {count > 0 && (
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
