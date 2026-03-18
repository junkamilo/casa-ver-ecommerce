"use client";

import { Search, Filter, CreditCard } from "lucide-react";
import { ALL_STATUSES, ALL_METHODS } from "../constants";
import AdminSelect from "@/components/ui/AdminSelect";

interface PedidosFiltersProps {
  search: string;
  onSearchChange: (s: string) => void;
  statusFilter: string;
  onStatusChange: (s: string) => void;
  methodFilter: string;
  onMethodChange: (s: string) => void;
}

export function PedidosFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  methodFilter,
  onMethodChange,
}: PedidosFiltersProps) {
  return (
    <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-md">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por cliente o ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#C19A6B]/10 transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full md:w-auto md:flex">
        <AdminSelect
          value={statusFilter}
          onChange={onStatusChange}
          options={ALL_STATUSES}
          icon={<Filter className="w-3.5 h-3.5" />}
          className="md:w-36"
        />
        <AdminSelect
          value={methodFilter}
          onChange={onMethodChange}
          options={ALL_METHODS}
          icon={<CreditCard className="w-3.5 h-3.5" />}
          className="md:w-40"
        />
      </div>
    </div>
  );
}
