import Link from "next/link";
import { AlertTriangle, ArrowUpRight, ClipboardList, MessageSquare, Bell } from "lucide-react";
import type { DashboardBacklogDTO, DashboardSlaItemDTO } from "@/modules/adminCatalog/dashboard/contracts/dashboard.dto";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import { formatCOP } from "../utils";

interface Props {
  slaQueue: DashboardSlaItemDTO[];
  backlog: DashboardBacklogDTO;
}

const SEVERITY_STYLES = {
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  critical: "bg-red-50 text-red-800 border-red-200",
} as const;

function BacklogTile({
  label,
  value,
  href,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  href: string;
  icon: typeof Bell;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-3 hover:border-[#154734]/30 hover:bg-white transition-colors"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`p-2 rounded-lg ${accent}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-gray-500 font-medium">{label}</p>
          <p className="text-lg font-black text-gray-900">{value}</p>
        </div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-gray-400 shrink-0" />
    </Link>
  );
}

export default function OperationsCockpit({ slaQueue, backlog }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
      {/* Cola SLA */}
      <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Cola SLA de pedidos</h2>
              <p className="text-[11px] text-gray-400">Pedidos que superan tiempos operativos</p>
            </div>
          </div>
          <Link
            href="/admin/pedidos"
            className="text-xs font-semibold text-[#154734] flex items-center gap-0.5 shrink-0"
          >
            Ver pedidos <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
          {slaQueue.length === 0 ? (
            <SectionEmptyState message="Sin pedidos fuera de SLA. Operación al día." />
          ) : (
            slaQueue.map((item) => (
              <Link
                key={item.orderId}
                href={`/admin/pedidos?abrir=${encodeURIComponent(item.orderNumber)}`}
                className="flex items-start gap-3 px-4 sm:px-5 py-3 hover:bg-gray-50/80 transition-colors"
              >
                <span
                  className={`mt-0.5 shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${SEVERITY_STYLES[item.severity]}`}
                >
                  {item.severity === "critical" ? "Crítico" : "Alerta"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900">
                    {item.orderNumber}{" "}
                    <span className="font-medium text-gray-500">· {item.statusLabel}</span>
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {item.customerName ?? "Cliente"} · {formatCOP(item.total)}
                  </p>
                  <p className="text-[11px] text-[#154734] font-medium mt-1">{item.suggestedAction}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-black text-gray-800">{item.waitingLabel}</p>
                  <p className="text-[10px] text-gray-400">esperando</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Pendientes backoffice */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#154734]/10 rounded-xl">
              <ClipboardList className="w-4 h-4 text-[#154734]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Pendientes de backoffice</h2>
              <p className="text-[11px] text-gray-400">Tareas que requieren acción del equipo</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          <BacklogTile
            label="Pedidos por atender"
            value={backlog.ordersNeedingAttention}
            href="/admin/pedidos"
            icon={ClipboardList}
            accent="bg-blue-50 text-blue-600"
          />
          <BacklogTile
            label="Reseñas por moderar"
            value={backlog.pendingReviews}
            href="/admin/resenas"
            icon={MessageSquare}
            accent="bg-purple-50 text-purple-600"
          />
          <BacklogTile
            label="Notificaciones sin leer"
            value={backlog.unreadNotifications}
            href="/admin/pedidos"
            icon={Bell}
            accent="bg-amber-50 text-amber-600"
          />

          <div className="pt-2 border-t border-gray-100 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-gray-50 px-2 py-2">
              <p className="text-sm font-black text-gray-800">{backlog.pendingOrders}</p>
              <p className="text-[10px] text-gray-500">Pendientes</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-2 py-2">
              <p className="text-sm font-black text-gray-800">{backlog.paidAwaitingFulfillment}</p>
              <p className="text-[10px] text-gray-500">Por enviar</p>
            </div>
            <div className="rounded-lg bg-gray-50 px-2 py-2">
              <p className="text-sm font-black text-gray-800">{backlog.processingOrders}</p>
              <p className="text-[10px] text-gray-500">Procesando</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
