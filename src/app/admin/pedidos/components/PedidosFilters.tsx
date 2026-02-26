"use client";

import { Search, Filter, CreditCard } from "lucide-react";
import { ALL_STATUSES, ALL_METHODS } from "../constants";

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

      <div className="grid grid-cols-2 sm:flex gap-3 w-full md:w-auto">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full sm:w-40 pl-9 sm:pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 bg-white appearance-none cursor-pointer hover:border-[#154734]"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <select
            value={methodFilter}
            onChange={(e) => onMethodChange(e.target.value)}
            className="w-full sm:w-40 pl-9 sm:pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 bg-white appearance-none cursor-pointer hover:border-[#154734]"
          >
            {ALL_METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
