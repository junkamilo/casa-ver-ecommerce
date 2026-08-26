"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { Edit2, Loader2, Save, X } from "lucide-react";
import { useShippingConfigManager } from "./hooks/useShippingConfigManager";
import ShippingRatesTable from "./components/ShippingRatesTable";
import ShippingRateModal from "./components/ShippingRateModal";
import PriceInput from "@/app/admin/productos/components/shared/PriceInput";
import { LOCALE } from "./constants";
import type { ShippingRateDTO } from "@/modules/shipping/contracts/shipping.dto";
import { Plus, Search } from "lucide-react";
import AdminSelect from "@/components/ui/AdminSelect";
import { Button } from "@/components/ui/button";
import AdminDataTable from "@/components/ui/AdminDataTable";

export default function PrecioEnviosPage() {
  const m = useShippingConfigManager();
  const [configuringRate, setConfiguringRate] = useState<ShippingRateDTO | null | "new">(null);
  const [isConfiguringNational, setIsConfiguringNational] = useState(false);
  const [activeTab, setActiveTab] = useState<"national" | "zones" | "freeshipping">("national");
  const [searchZone, setSearchZone] = useState("");
  const [statusFilterZone, setStatusFilterZone] = useState("");
  const [isEditingFreeShipping, setIsEditingFreeShipping] = useState(false);
  const [draftFreeShipping, setDraftFreeShipping] = useState("");

  const nationalRate = m.rates.find((r) => r.id === m.defaultRateId);
  
  const specialRates = m.rates.filter((r) => r.id !== m.defaultRateId).filter((r) => {
    const matchesSearch = (r.name || "Sin nombre").toLowerCase().includes(searchZone.toLowerCase());
    const isDefault = r.id === m.defaultRateId;
    const inUse = r.citiesCount > 0 || isDefault;
    const matchesStatus = statusFilterZone === "in_use" ? inUse : statusFilterZone === "unused" ? !inUse : true;
    return matchesSearch && matchesStatus;
  });

  const freeShippingDisplay = `$${(parseInt(m.freeShippingMinSubtotal || "0", 10) || 0).toLocaleString(LOCALE)}`;
  const freeShippingDirty =
    (parseInt(draftFreeShipping || "0", 10) || 0) !== (parseInt(m.freeShippingMinSubtotal || "0", 10) || 0);

  const startEditFreeShipping = () => {
    setDraftFreeShipping(m.freeShippingMinSubtotal || "0");
    setIsEditingFreeShipping(true);
  };

  const cancelEditFreeShipping = () => {
    setDraftFreeShipping(m.freeShippingMinSubtotal || "0");
    setIsEditingFreeShipping(false);
  };

  const saveFreeShipping = async () => {
    const ok = await m.handleSaveConfig({ freeShippingMinSubtotal: draftFreeShipping });
    if (ok) setIsEditingFreeShipping(false);
  };

  return (
    <div className="space-y-8 pb-10">
      <AdminPageHeader title="Precios y Configuración de Envíos" />

      {/* TABS */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("national")}
            className={`${
              activeTab === "national"
                ? "border-[#154734] text-[#154734]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Tarifa nacional
          </button>
          <button
            onClick={() => setActiveTab("zones")}
            className={`${
              activeTab === "zones"
                ? "border-[#154734] text-[#154734]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Tarifa por zonas
          </button>
          <button
            onClick={() => setActiveTab("freeshipping")}
            className={`${
              activeTab === "freeshipping"
                ? "border-[#154734] text-[#154734]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Envío gratis
          </button>
        </nav>
      </div>

      {m.loading ? (
        <div className="flex items-center justify-center py-24 text-[#154734]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="mt-6">
          {activeTab === "national" && (
            <section className="space-y-6">
              {/* SECCIÓN TARIFA NACIONAL */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 py-2">
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-[#154734]">Tarifa Nacional (Resto del País)</h2>
                    <p className="text-sm text-gray-500 mt-1 max-w-xl">
                      Esta es la tarifa base que se cobrará por defecto a cualquier destino que no tenga una tarifa especial asignada.
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Button
                      onClick={() => {
                        setConfiguringRate(nationalRate || "new");
                        setIsConfiguringNational(true);
                      }}
                      className="bg-[#154734] text-white hover:bg-[#113a29]"
                    >
                      {nationalRate ? (
                        <>Editar tarifa nacional</>
                      ) : (
                        <><Plus className="w-4 h-4 mr-2" /> Crear tarifa nacional</>
                      )}
                    </Button>
                  </div>
                </div>

                <AdminDataTable
                  data={nationalRate ? [nationalRate] : []}
                  rowKey={(r) => r.id}
                  emptyState={{
                    title: "No hay tarifa nacional",
                    description: "Crea la tarifa base para habilitar envíos a nivel nacional.",
                  }}
                  columns={[
                    {
                      key: "name",
                      header: "Nombre",
                      render: (rate) => (
                        <div className="font-semibold text-[#154734]">
                          {rate.name || "Tarifa Nacional"}
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800">Defecto</span>
                        </div>
                      ),
                    },
                    {
                      key: "price",
                      header: "Precio",
                      render: (rate) => (
                        <span className="text-gray-700">${rate.price.toLocaleString(LOCALE)}</span>
                      ),
                    },
                    {
                      key: "inUse",
                      header: "En uso",
                      render: (rate) => (
                        <div className="text-gray-500 text-xs">
                          {rate.citiesCount > 0 ? <span>{rate.citiesCount} municipio(s)</span> : <span className="italic">Nivel nacional</span>}
                        </div>
                      ),
                    },
                    {
                      key: "actions",
                      header: "Acciones",
                      align: "right",
                      render: (rate) => (
                        <button
                          type="button"
                          onClick={() => {
                            setConfiguringRate(rate);
                            setIsConfiguringNational(true);
                          }}
                          className="text-xs font-semibold px-2 py-1.5 rounded-lg bg-[#154734]/10 text-[#154734] hover:bg-[#154734]/20 mr-2 transition-colors"
                        >
                          Configurar Precio
                        </button>
                      ),
                    },
                  ]}
                />
              </div>
            </section>
          )}

          {activeTab === "zones" && (
            <section className="space-y-6">
              {/* SECCIÓN TARIFAS ESPECIALES */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 py-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar tarifa por nombre..."
                      value={searchZone}
                      onChange={(e) => setSearchZone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#154734] outline-none"
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <AdminSelect
                      value={statusFilterZone}
                      onChange={setStatusFilterZone}
                      options={[
                        { value: "", label: "Todas" },
                        { value: "in_use", label: "En uso" },
                        { value: "unused", label: "Sin usar" }
                      ]}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <Button 
                      onClick={() => {
                        setConfiguringRate("new");
                        setIsConfiguringNational(false);
                      }}
                      className="bg-[#154734] text-white hover:bg-[#113a29]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva tarifa especial
                    </Button>
                  </div>
                </div>

                <ShippingRatesTable
                  rates={specialRates}
                  defaultRateId={m.defaultRateId}
                  onEdit={(rate) => {
                    setConfiguringRate(rate);
                    setIsConfiguringNational(false);
                  }}
                  onDelete={m.handleDeleteRate}
                />
              </div>
            </section>
          )}

          {activeTab === "freeshipping" && (
            <section className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 py-2">
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-[#154734]">Envío gratis</h2>
                  <p className="text-sm text-gray-500 mt-1 max-w-xl">
                    Subtotal neto mínimo (productos − cupón) para no cobrar envío.
                  </p>
                </div>
              </div>

              <AdminDataTable
                data={[{ id: "free-shipping-rule" }]}
                rowKey={(r) => r.id}
                columns={[
                  {
                    key: "rule",
                    header: "Configuración",
                    render: () => (
                      <div className="font-semibold text-gray-900">
                        Umbral para Envío Gratis
                      </div>
                    ),
                  },
                  {
                    key: "value",
                    header: "Valor (COP)",
                    render: () =>
                      isEditingFreeShipping ? (
                        <div className="relative max-w-[200px]">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                            $
                          </span>
                          <PriceInput
                            value={draftFreeShipping}
                            onChange={setDraftFreeShipping}
                            disabled={m.saving}
                            className="w-full pl-7 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#154734]/40 focus:border-[#154734] disabled:opacity-60"
                          />
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-gray-900 tabular-nums">
                          {freeShippingDisplay}
                        </span>
                      ),
                  },
                  {
                    key: "actions",
                    header: "Acciones",
                    align: "right",
                    render: () =>
                      isEditingFreeShipping ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={cancelEditFreeShipping}
                            disabled={m.saving}
                            className="border-gray-300"
                          >
                            <X className="w-4 h-4 mr-1.5" />
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            onClick={() => void saveFreeShipping()}
                            disabled={m.saving || !freeShippingDirty}
                            className="bg-[#154734] text-white hover:bg-[#113a29] transition-colors disabled:opacity-50"
                          >
                            {m.saving ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Save className="w-4 h-4 mr-2" />
                            )}
                            Guardar
                          </Button>
                        </div>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={startEditFreeShipping}
                          className="border-[#154734]/30 text-[#154734] hover:bg-[#154734]/5"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      ),
                  },
                ]}
              />
            </section>
          )}

          {configuringRate && (
            <ShippingRateModal
              rate={configuringRate === "new" ? null : configuringRate}
              departments={m.departments}
              municipalities={m.municipalities}
              isNationalRate={isConfiguringNational}
              onClose={() => setConfiguringRate(null)}
              onSave={async (id, name, price, munis) => {
                const savedRateId = await m.handleSaveRate(id, name, price, munis);
                if (isConfiguringNational && savedRateId) {
                  await m.handleSaveConfig({ defaultRateId: savedRateId });
                }
                setConfiguringRate(null);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
