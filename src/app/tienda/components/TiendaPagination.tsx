import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TiendaFilters } from "../types";

function buildQuery(filters: TiendaFilters, page: number): string {
  const p = new URLSearchParams();
  if (filters.minPrice?.trim()) p.set("minPrice", filters.minPrice.trim());
  if (filters.maxPrice?.trim()) p.set("maxPrice", filters.maxPrice.trim());
  if (filters.color?.trim()) p.set("color", filters.color.trim());
  if (filters.q?.trim()) p.set("q", filters.q.trim());
  if (page > 1) p.set("page", String(page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

type Props = {
  page: number;
  totalPages: number;
  totalProducts: number;
  filters: TiendaFilters;
};

export default function TiendaPagination({ page, totalPages, totalProducts, filters }: Props) {
  if (totalPages <= 1) return null;

  const prevHref = page > 1 ? `/tienda${buildQuery(filters, page - 1)}` : null;
  const nextHref = page < totalPages ? `/tienda${buildQuery(filters, page + 1)}` : null;

  const windowSize = 5;
  let start = Math.max(1, page - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);
  const pageNums: number[] = [];
  for (let i = start; i <= end; i++) pageNums.push(i);

  return (
    <nav
      className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
      aria-label="Paginación de productos"
    >
      <p className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
        Página <span className="font-semibold text-gray-800">{page}</span> de{" "}
        <span className="font-semibold text-gray-800">{totalPages}</span>
        <span className="hidden sm:inline"> · {totalProducts} productos</span>
      </p>

      <div className="flex items-center gap-2 order-1 sm:order-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#154734] hover:bg-[#154734]/5 hover:border-[#154734]/30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden />
            Anterior
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-100 text-sm font-semibold text-gray-300 cursor-not-allowed">
            <ChevronLeft className="w-4 h-4" aria-hidden />
            Anterior
          </span>
        )}

        <ul className="flex items-center gap-1">
          {start > 1 && (
            <>
              <li>
                <Link
                  href={`/tienda${buildQuery(filters, 1)}`}
                  className="min-w-9 h-9 inline-flex items-center justify-center rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#154734]/10"
                >
                  1
                </Link>
              </li>
              {start > 2 && (
                <li className="px-1 text-gray-400 text-sm" aria-hidden>
                  …
                </li>
              )}
            </>
          )}
          {pageNums.map((n) => (
            <li key={n}>
              {n === page ? (
                <span
                  className="min-w-9 h-9 inline-flex items-center justify-center rounded-lg text-sm font-bold bg-[#154734] text-white shadow-sm"
                  aria-current="page"
                >
                  {n}
                </span>
              ) : (
                <Link
                  href={`/tienda${buildQuery(filters, n)}`}
                  className="min-w-9 h-9 inline-flex items-center justify-center rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#154734]/10"
                >
                  {n}
                </Link>
              )}
            </li>
          ))}
          {end < totalPages && (
            <>
              {end < totalPages - 1 && (
                <li className="px-1 text-gray-400 text-sm" aria-hidden>
                  …
                </li>
              )}
              <li>
                <Link
                  href={`/tienda${buildQuery(filters, totalPages)}`}
                  className="min-w-9 h-9 inline-flex items-center justify-center rounded-lg text-sm font-semibold text-gray-600 hover:bg-[#154734]/10"
                >
                  {totalPages}
                </Link>
              </li>
            </>
          )}
        </ul>

        {nextHref ? (
          <Link
            href={nextHref}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-[#154734] hover:bg-[#154734]/5 hover:border-[#154734]/30 transition-colors"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" aria-hidden />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-100 text-sm font-semibold text-gray-300 cursor-not-allowed">
            Siguiente
            <ChevronRight className="w-4 h-4" aria-hidden />
          </span>
        )}
      </div>
    </nav>
  );
}
