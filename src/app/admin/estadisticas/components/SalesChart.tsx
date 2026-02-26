import { Calendar } from "lucide-react";
import { DAILY_SALES, MAX_DAILY_SALE, formatPrice } from "../constants";

export function SalesChart() {
  return (
    <div className="lg:col-span-2 bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" />
          Resumen de Ventas
        </h3>
      </div>

      <div className="flex items-end gap-2 sm:gap-6 h-48 sm:h-64 w-full">
        {DAILY_SALES.map((day, i) => (
          <div
            key={day.day}
            className="flex-1 flex flex-col items-center gap-3 group h-full justify-end"
          >
            <div className="w-full relative h-full flex items-end">
              <div
                className="w-full bg-[#154734] rounded-t-lg transition-all duration-500 ease-out group-hover:bg-[#C19A6B] relative"
                style={{
                  height: `${(day.amount / MAX_DAILY_SALE) * 100}%`,
                  opacity: 0.8 + i * 0.03,
                }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-10 font-medium">
                  {formatPrice(day.amount)}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-gray-500 group-hover:text-[#154734] transition-colors">
              {day.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
