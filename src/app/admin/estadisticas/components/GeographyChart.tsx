import { MapPin, Building2 } from "lucide-react";
import type { GeographyData } from "../types/types";

interface Props {
  data: GeographyData;
}

function GeoList({ items, label, icon }: { items: GeographyData["departments"]; label: string; icon: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center gap-1.5 mb-3">
        {icon}
        {label}
      </h4>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">Sin datos</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={item.name}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-xs font-black w-5 shrink-0 ${i === 0 ? "text-[#154734]" : "text-gray-400"}`}>
                    {i + 1}
                  </span>
                  <span className="font-medium text-gray-800 truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs text-gray-500">
                  <span className="font-bold text-gray-700">{item.orders} ped.</span>
                  <span className="font-bold text-[#154734]">{item.percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-700 ${i === 0 ? "bg-[#154734]" : "bg-[#C19A6B]/60"}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GeographyChart({ data }: Props) {
  const isEmpty = data.departments.length === 0 && data.cities.length === 0;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <div className="flex items-start justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" />
            Distribución Geográfica
          </h3>
          {data.totalOrders > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{data.totalOrders} pedidos entregados en el período</p>
          )}
        </div>
      </div>

      {isEmpty ? (
        <div className="flex items-center justify-center h-24 text-gray-400">
          <p className="text-sm">Sin datos para este período</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          <GeoList
            items={data.departments}
            label="Departamentos"
            icon={<Building2 className="w-3.5 h-3.5" />}
          />
          <GeoList
            items={data.cities}
            label="Ciudades"
            icon={<MapPin className="w-3.5 h-3.5" />}
          />
        </div>
      )}
    </div>
  );
}
