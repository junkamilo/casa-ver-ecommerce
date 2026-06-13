import { ChevronLeft, ChevronRight } from "lucide-react";

/** Opciones estándar de filas por página en paneles admin */
export const ADMIN_PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100] as const;

export const DEFAULT_ADMIN_PAGE_SIZE = 10;

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
  pageSize: number;
  itemLabel?: string;
  /** Muestra el resumen y controles aunque haya una sola página */
  alwaysShow?: boolean;
  /** Si se pasa, muestra el selector de cantidad por página */
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: readonly number[];
}

export default function AdminPagination({
  page,
  totalPages,
  onPageChange,
  total,
  pageSize,
  itemLabel = "elementos",
  alwaysShow = false,
  onPageSizeChange,
  pageSizeOptions = ADMIN_PAGE_SIZE_OPTIONS,
}: Props) {
  if (total === 0) return null;
  if (totalPages <= 1 && !alwaysShow) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const getPages = (): (number | "...")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "...")[] = [1];
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const showPageControls = alwaysShow || totalPages > 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 px-1">
      <div className="flex flex-col sm:flex-row items-center gap-3 order-2 sm:order-1 w-full sm:w-auto">
        <p className="text-xs text-gray-500 text-center sm:text-left">
          Mostrando {from}–{to} de {total} {itemLabel}
        </p>

        {onPageSizeChange && (
          <label className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
            <span className="font-medium">Mostrar</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-9 pl-3 pr-8 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-[#C19A6B] focus:ring-2 focus:ring-[#C19A6B]/20 cursor-pointer"
              aria-label={`Cantidad de ${itemLabel} por página`}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span>por página</span>
          </label>
        )}
      </div>

      {showPageControls && (
        <div className="flex items-center gap-1 order-1 sm:order-2">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#154734] hover:text-[#154734] active:scale-90 transition-all"
            aria-label="Página anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPages().map((p, i) =>
            p === "..." ? (
              <span
                key={`dots-${i}`}
                className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p as number)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all active:scale-90 ${
                  page === p
                    ? "bg-[#154734] text-white border border-[#154734]"
                    : "border border-gray-200 bg-white text-gray-700 hover:border-[#154734] hover:text-[#154734]"
                }`}
                aria-label={`Página ${p}`}
                aria-current={page === p ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#154734] hover:text-[#154734] active:scale-90 transition-all"
            aria-label="Página siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
