import { ShieldAlert, CheckCircle2 } from "lucide-react";
import type { DashboardPaymentIncidentsDTO } from "@/modules/adminCatalog/dashboard/contracts/dashboard.dto";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import { timeAgo } from "../utils";

interface Props {
  incidents: DashboardPaymentIncidentsDTO;
}

export default function PaymentIncidentsCard({ incidents }: Props) {
  const isHealthy = incidents.errorCount === 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${isHealthy ? "bg-emerald-50" : "bg-red-50"}`}>
            {isHealthy ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-600" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Salud de pagos y webhooks</h2>
            <p className="text-[11px] text-gray-400">
              Monitoreo de solo lectura · últimos {incidents.windowMinutes} min
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              isHealthy
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {isHealthy ? "Sin incidentes" : `${incidents.errorCount} incidente(s)`}
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-gray-50">
        <div className="rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-[10px] text-gray-500 font-medium">Eventos</p>
          <p className="text-lg font-black text-gray-900">{incidents.totalEvents}</p>
        </div>
        <div className="rounded-xl bg-gray-50 px-3 py-2.5">
          <p className="text-[10px] text-gray-500 font-medium">Errores</p>
          <p className={`text-lg font-black ${incidents.errorCount > 0 ? "text-red-600" : "text-gray-900"}`}>
            {incidents.errorCount}
          </p>
        </div>
        {incidents.byProvider.slice(0, 2).map((row) => (
          <div key={row.provider} className="rounded-xl bg-gray-50 px-3 py-2.5">
            <p className="text-[10px] text-gray-500 font-medium">{row.provider}</p>
            <p className="text-lg font-black text-gray-900">
              {row.errors}
              <span className="text-xs font-medium text-gray-400"> / {row.total}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="divide-y divide-gray-50 max-h-56 overflow-y-auto">
        {incidents.recent.length === 0 ? (
          <SectionEmptyState message="Sin incidentes de webhook en la ventana actual." />
        ) : (
          incidents.recent.map((item) => (
            <div key={item.id} className="px-4 sm:px-5 py-3 flex items-start gap-3">
              <span className="mt-0.5 shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                {item.provider}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {item.eventType ?? "evento desconocido"} · HTTP {item.status}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                  {item.errorMessage ?? "Error reportado por webhook"}
                </p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">
                {timeAgo(item.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
