import Link from "next/link";
import { Store } from "lucide-react";
import type { HeaderActionsProps } from "../types";

export function HeaderActions({ rightSlot }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {rightSlot}
      {rightSlot && <div className="h-8 w-[1px] bg-gray-200 hidden sm:block" />}
      <Link
        href="/"
        className="text-sm font-medium text-gray-600 hover:text-[#154734] transition-colors flex items-center gap-2"
      >
        <span className="hidden sm:inline">Ver Tienda</span>
        <Store className="w-4 h-4" />
      </Link>
    </div>
  );
}
