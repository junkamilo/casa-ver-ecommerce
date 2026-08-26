"use client";

import { Trash2, MapPin } from "lucide-react";
import { LOCALE } from "../constants";
import type { ShippingRateDTO } from "@/modules/shipping/contracts/shipping.dto";
import AdminDataTable from "@/components/ui/AdminDataTable";

export default function ShippingRatesTable({
  rates,
  defaultRateId,
  onEdit,
  onDelete,
}: {
  rates: ShippingRateDTO[];
  defaultRateId: string | null;
  onEdit: (rate: ShippingRateDTO) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <AdminDataTable
      data={rates}
      rowKey={(r) => r.id}
      emptyState={{
        title: "Aún no has creado ninguna tarifa",
        description: "Agrega tu primera tarifa especial para comenzar.",
        icon: <MapPin className="w-6 h-6 text-[#154734]" />
      }}
      getRowClassName={(r) => r.id === defaultRateId ? 'bg-emerald-50/30' : undefined}
      columns={[
        {
          key: "name",
          header: "Nombre",
          render: (rate) => {
            const isDefault = rate.id === defaultRateId;
            return (
              <div className="font-semibold text-[#154734]">
                {rate.name ? rate.name : <span className="italic text-gray-400">Sin nombre</span>}
                {isDefault && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">Defecto</span>}
              </div>
            );
          }
        },
        {
          key: "price",
          header: "Precio",
          render: (rate) => (
            <span className="text-gray-700">${rate.price.toLocaleString(LOCALE)}</span>
          )
        },
        {
          key: "inUse",
          header: "En uso",
          render: (rate) => (
            <div className="text-gray-500 text-xs">
              {rate.citiesCount > 0 ? <span>{rate.citiesCount} municipio(s)</span> : <span className="italic">Sin usar</span>}
            </div>
          )
        },
        {
          key: "actions",
          header: "Acciones",
          align: "right",
          render: (rate) => {
            const isDefault = rate.id === defaultRateId;
            const inUse = rate.citiesCount > 0 || isDefault;
            return (
              <div className="inline-flex items-center gap-1.5 justify-end">
                <button
                  type="button"
                  onClick={() => onEdit(rate)}
                  className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-[#154734]/10 text-[#154734] hover:bg-[#154734]/20 mr-2 transition-colors"
                >
                  Configurar Zonas
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(rate.id)}
                  disabled={inUse}
                  title={inUse ? "No puedes eliminar una tarifa en uso o por defecto" : undefined}
                  className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
                  aria-label="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          }
        }
      ]}
    />
  );
}
