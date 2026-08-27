import { Menu } from "lucide-react";
import type { BreadcrumbProps } from "../types";

export function Breadcrumb({ root, current, onMenuOpen }: BreadcrumbProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onMenuOpen}
        className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="w-6 h-6" />
      </button>

      {root ? (
        <div className="hidden sm:flex items-center text-sm text-gray-500">
          <span className="font-medium text-gray-900">{root}</span>
          <span className="mx-2">/</span>
          <span className="capitalize text-[#154734]">{current}</span>
        </div>
      ) : null}
    </div>
  );
}
