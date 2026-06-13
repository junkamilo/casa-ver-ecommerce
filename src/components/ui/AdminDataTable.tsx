"use client";

import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

export type AdminDataTableColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
};

export type AdminDataTableEmptyState = {
  title: string;
  description: string;
  icon?: ReactNode;
};

export interface AdminDataTableProps<T> {
  columns: AdminDataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: AdminDataTableEmptyState;
  mobileRender?: (row: T) => ReactNode;
  rowKey: (row: T) => string;
  footer?: ReactNode;
  /** Sin scroll interno: la paginación controla cuántas filas se muestran */
  paginated?: boolean;
  getRowClassName?: (row: T) => string | undefined;
}

export default function AdminDataTable<T>({
  columns,
  data,
  loading = false,
  emptyState,
  mobileRender,
  rowKey,
  footer,
  paginated = false,
  getRowClassName,
}: AdminDataTableProps<T>) {
  const desktopTableClass = paginated
    ? "hidden md:block"
    : "hidden md:block overflow-auto max-h-150";
  const shellClass = "bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden";

  if (loading) {
    return (
      <div className={shellClass}>
        <div className="py-20 flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
        </div>
        {footer ? <div className="px-6 pb-5 border-t border-gray-100">{footer}</div> : null}
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className={shellClass}>
        <div className="text-center py-16">
          {emptyState.icon && (
            <div className="w-14 h-14 bg-[#154734]/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
              {emptyState.icon}
            </div>
          )}
          <p className="text-gray-500 font-medium mb-1">{emptyState.title}</p>
          <p className="text-sm text-gray-400">{emptyState.description}</p>
        </div>
        {footer ? <div className="px-6 pb-5 border-t border-gray-100">{footer}</div> : null}
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <div className={desktopTableClass}>
        <table className="w-full">
          <thead>
            <tr className="bg-[#F8F9FA] border-b border-gray-200">
              {columns.map((col, i) => (
                <th
                  key={col.key}
                  className={`sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide shadow-[0_1px_0_0_rgba(229,231,235,1)] ${
                    col.align === "right" || i === columns.length - 1
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr
                key={rowKey(row)}
                className={`transition-colors group ${
                  getRowClassName?.(row) ?? "hover:bg-gray-50/60"
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-6 py-4 ${col.align === "right" ? "text-right" : "text-left"}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mobileRender && (
        <div className="md:hidden">
          {data.map((row) => (
            <div
              key={rowKey(row)}
              className={`p-4 border-b border-gray-100 last:border-b-0 ${
                getRowClassName?.(row) ?? ""
              }`}
            >
              {mobileRender(row)}
            </div>
          ))}
        </div>
      )}

      {footer ? <div className="px-6 pb-5 border-t border-gray-100">{footer}</div> : null}
    </div>
  );
}
