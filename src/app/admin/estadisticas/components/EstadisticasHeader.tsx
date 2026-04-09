"use client";

import { PERIOD_LABELS } from "../constants/constants";
import type { Period } from "../types/types";
import { useRouter, useSearchParams } from "next/navigation";
import AdminPageHeader from "@/components/ui/AdminPageHeader";

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
        <AdminPageHeader title="Reportes & Estadísticas" />
      </div>

      <div className="bg-white border border-gray-200 rounded-full p-1 flex shadow-sm self-start md:self-auto">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${period === p
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
