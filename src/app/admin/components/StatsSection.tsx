import { TrendingUp } from "lucide-react";
import type { StatItem } from "../types";

interface Props {
  stats: StatItem[];
}

export default function StatsSection({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-white rounded-2xl border ${stat.border} p-4 md:p-5 shadow-sm active:scale-95 sm:hover:shadow-md transition-all relative overflow-hidden group cursor-pointer`}
        >
          {/* Fondo decorativo esquina */}
          <div
            className={`absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 ${stat.bg} rounded-bl-full -mr-3 -mt-3 sm:-mr-4 sm:-mt-4 transition-transform group-hover:scale-110 opacity-40`}
          />

          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 sm:p-2.5 ${stat.bg} rounded-xl ${stat.color} shrink-0`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                <span className="whitespace-nowrap">{stat.change}</span>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight">
              {stat.value}
            </h3>
            <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 font-medium mt-1 line-clamp-1">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
