"use client";

import { BarChart3 } from "lucide-react";
import { PERIOD_LABELS } from "../constants";
import type { Period } from "../types";
import { useRouter, useSearchParams } from "next/navigation";

export function EstadisticasHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = (searchParams.get("period") || "week") as Period;

  const handlePeriodChange = (newPeriod: Period) => {
    router.push(`/admin/estadisticas?period=${newPeriod}`);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold text-[#154734]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Reportes & Estadísticas
        </h1>
        <p className="text-gray-500 mt-1 flex items-center gap-2 text-xs sm:text-sm">
          <BarChart3 className="w-4 h-4" />
          Visión en tiempo real del rendimiento de tu tienda
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-full p-1 flex shadow-sm self-start md:self-auto">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
              period === p
                ? "bg-[#154734] text-white shadow-md"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>
    </div>
  );
}
