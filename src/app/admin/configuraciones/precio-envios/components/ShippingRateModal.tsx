"use client";

import { useState, useMemo } from "react";
import { Search, Loader2, Save } from "lucide-react";
import type { ShippingRateDTO } from "@/modules/shipping/contracts/shipping.dto";
import type { DepartmentAdminDTO, MunicipalityAdminDTO } from "@/modules/geography/contracts/geography.dto";
import AdminSelect from "@/components/ui/AdminSelect";
import PriceInput from "@/app/admin/productos/components/shared/PriceInput";

interface Props {
  rate?: ShippingRateDTO | null; // If null/undefined, we are creating a new one
  departments: DepartmentAdminDTO[];
  municipalities: MunicipalityAdminDTO[];
  isNationalRate?: boolean;
  onClose: () => void;
  onSave: (id: string | null, name: string, price: number, selectedMuniIds: string[]) => Promise<void>;
}

export default function ShippingRateModal({
  rate,
  departments,
  municipalities,
  isNationalRate = false,
  onClose,
  onSave
}: Props) {
  const [name, setName] = useState(rate?.name || (isNationalRate ? "Tarifa Nacional" : ""));
  const [price, setPrice] = useState(rate ? String(rate.price) : "");
  
  // Initialize with currently assigned municipalities
  const [selectedMunis, setSelectedMunis] = useState<Set<string>>(new Set(
    rate && !isNationalRate ? municipalities.filter(m => m.shippingRateId === rate.id).map(m => m.id) : []
  ));

  // Compute the visually locked municipalities for the national rate
  const nationalMuniIds = useMemo(() => {
    if (!isNationalRate) return new Set<string>();
    const unassigned = municipalities.filter(m => !m.shippingRateId || (rate && m.shippingRateId === rate.id));
    return new Set(unassigned.map(m => m.id));
  }, [isNationalRate, municipalities, rate]);

  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredMunicipalities = useMemo(() => {
    return municipalities.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchDept = deptFilter ? m.departmentId === deptFilter : true;
      return matchSearch && matchDept;
    });
  }, [municipalities, search, deptFilter]);

  const toggleMuni = (muniId: string) => {
    const newSet = new Set(selectedMunis);
    if (newSet.has(muniId)) newSet.delete(muniId);
    else newSet.add(muniId);
    setSelectedMunis(newSet);
  };

  const toggleAllFiltered = () => {
    const newSet = new Set(selectedMunis);
    const allSelected = filteredMunicipalities.every(m => newSet.has(m.id));
    if (allSelected) {
      filteredMunicipalities.forEach(m => newSet.delete(m.id));
    } else {
      filteredMunicipalities.forEach(m => newSet.add(m.id));
    }
    setSelectedMunis(newSet);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const savedMunis = isNationalRate ? [] : Array.from(selectedMunis);
      await onSave(rate?.id || null, name, parseInt(price || "0", 10) || 0, savedMunis);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-[#F8F9FA]">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              {isNationalRate ? "Tarifa Nacional (Resto del país)" : rate ? "Editar Tarifa Especial" : "Nueva Tarifa Especial"}
            </h3>
            <p className="text-sm text-gray-500">
              {isNationalRate 
                ? "Configura el precio por defecto para cualquier destino sin tarifa especial asignada." 
                : "Configura el precio y selecciona los municipios a los que aplica."}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        <div className="flex-1 overflow-auto flex flex-col md:flex-row">
          {/* Left panel: Info */}
          <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-100 space-y-6">
            {!isNationalRate && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                  Nombre de la tarifa
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C19A6B]"
                  placeholder="Ej. Regional Nororiente"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
                Precio (COP)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
                <PriceInput
                  value={price}
                  onChange={setPrice}
                  className="w-full pl-8 pr-4 py-2.5 bg-[#FAFAFA] border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#C19A6B]"
                />
              </div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-sm text-emerald-800 font-medium mb-1">
                Municipios {isNationalRate ? "aplicables" : "seleccionados"}
              </p>
              <p className="text-3xl font-bold text-emerald-600">
                {isNationalRate ? nationalMuniIds.size : selectedMunis.size}
              </p>
            </div>
          </div>

          {/* Right panel: Municipalities */}
          <div className="w-full md:w-2/3 p-6 flex flex-col">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 block">
              {isNationalRate ? "Municipios Aplicables" : "Asignar Municipios"}
            </label>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar municipio..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#154734] outline-none"
                  />
                </div>
                <div className="w-full sm:w-64">
                  <AdminSelect
                    value={deptFilter}
                    onChange={setDeptFilter}
                    options={[
                      { value: "", label: "Todos los departamentos" },
                      ...departments.map(d => ({ value: d.id, label: d.name }))
                    ]}
                  />
                </div>
              </div>

              <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Listado ({filteredMunicipalities.length})
                  </span>
                  {!isNationalRate && (
                    <button 
                      onClick={toggleAllFiltered}
                      className="text-xs font-bold text-[#154734] hover:underline"
                    >
                      Seleccionar / Deseleccionar Todos los visibles
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[400px]">
                  {filteredMunicipalities.slice(0, 300).map(m => {
                    const isChecked = isNationalRate ? nationalMuniIds.has(m.id) : selectedMunis.has(m.id);
                    const isDisabled = isNationalRate;
                    const isOtherAssigned = isNationalRate && !nationalMuniIds.has(m.id);

                    return (
                      <label key={m.id} className={`flex items-center justify-between p-2 rounded-lg ${isOtherAssigned ? 'bg-gray-100/50 cursor-not-allowed opacity-50' : 'hover:bg-gray-50 cursor-pointer'}`}>
                        <div className="flex flex-col">
                          <span className={`font-medium text-sm ${isOtherAssigned ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{m.name}</span>
                          <span className={`text-xs ${isOtherAssigned ? 'text-gray-400' : 'text-gray-500'}`}>{m.departmentName} {isOtherAssigned ? "(Con tarifa especial)" : ""}</span>
                        </div>
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => !isDisabled && toggleMuni(m.id)}
                          className="rounded border-gray-300 text-[#154734] focus:ring-[#154734] w-4 h-4 disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                      </label>
                    );
                  })}
                  {filteredMunicipalities.length > 300 && (
                    <p className="text-xs text-center text-gray-400 py-4">Demasiados resultados, usa el buscador.</p>
                  )}
                  {filteredMunicipalities.length === 0 && (
                    <p className="text-xs text-center text-gray-400 py-4">No se encontraron municipios.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-[#F8F9FA]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#154734] text-white text-sm font-bold hover:bg-[#0f3626] disabled:opacity-40 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Tarifa
          </button>
        </div>

      </div>
    </div>
  );
}
