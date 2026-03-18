"use client";

import { useState } from "react";
import { PieChart, ChevronDown } from "lucide-react";
import type { CategorySale } from "../types";

interface CategoryChartProps {
  categorySales: CategorySale[];
}

export function CategoryChart({ categorySales }: CategoryChartProps) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
          <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" />
          Categorías Top
        </h3>
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 hover:border-[#154734] hover:text-[#154734] text-gray-400 transition-all active:scale-90"
        >
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
        </button>
      </div>

      {open && (
        <div className="flex-1 flex flex-col justify-center space-y-6">
          {categorySales.map((cat) => (
            <div key={cat.name} className="group">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-700 font-semibold group-hover:text-[#154734] transition-colors">
                  {cat.name}
                </span>
                <span className="text-gray-500 text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                  {cat.percentage}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`${cat.color} h-2 rounded-full transition-all duration-1000 ease-out group-hover:brightness-110`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
