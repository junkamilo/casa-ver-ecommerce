"use client";

import { useState } from "react";
import { Plus, Edit2, Globe2, Search } from "lucide-react";
import AdminSelect from "@/components/ui/AdminSelect";
import AdminDataTable from "@/components/ui/AdminDataTable";
import type { CountryAdminDTO, CreateCountryInput } from "@/modules/geography/contracts/geography.dto";
import { Button } from "@/components/ui/button";

interface Props {
  countries: CountryAdminDTO[];
  onSave: (id: string | null, data: CreateCountryInput) => Promise<void>;
}

export default function CountriesManager({ countries, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryAdminDTO | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    isoCode2: "",
    isoCode3: "",
    numericCode: "",
    phoneCode: "",
    currency: "",
    isActive: true,
  });

  const handleOpenNew = () => {
    setEditingCountry(null);
    setFormData({
      name: "", isoCode2: "", isoCode3: "", numericCode: "", phoneCode: "", currency: "COP", isActive: true
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (c: CountryAdminDTO) => {
    setEditingCountry(c);
    setFormData({
      name: c.name,
      isoCode2: c.isoCode2,
      isoCode3: c.isoCode3,
      numericCode: c.numericCode || "",
      phoneCode: c.phoneCode || "",
      currency: c.currency || "",
      isActive: c.isActive,
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(editingCountry ? editingCountry.id : null, {
      name: formData.name,
      isoCode2: formData.isoCode2,
      isoCode3: formData.isoCode3,
      numericCode: formData.numericCode || undefined,
      phoneCode: formData.phoneCode || undefined,
      currency: formData.currency || undefined,
      isActive: formData.isActive,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">

      <div className="flex flex-col md:flex-row gap-4 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar país por nombre o ISO..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#154734] outline-none"
          />
        </div>
        <div className="w-full md:w-48">
          <AdminSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "", label: "Todos los estados" },
              { value: "active", label: "Activos" },
              { value: "inactive", label: "Inactivos" }
            ]}
          />
        </div>
        <div className="flex justify-between items-center">
          <Button onClick={handleOpenNew} className="bg-[#154734] text-white hover:bg-[#113a29]">
            <Plus className="w-4 h-4 mr-2" />
            Añadir País
          </Button>
        </div>
      </div>

      <AdminDataTable
        data={countries.filter(c => {
          const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.isoCode2.toLowerCase().includes(search.toLowerCase());
          const matchesStatus = statusFilter === "active" ? c.isActive :
            statusFilter === "inactive" ? !c.isActive : true;
          return matchesSearch && matchesStatus;
        })}
        rowKey={(c) => c.id}
        emptyState={{
          title: "No hay países",
          description: "Agrega tu primer país para comenzar.",
          icon: <Globe2 className="w-6 h-6 text-[#154734]" />
        }}
        columns={[
          {
            key: "iso", header: "ISO",
            render: (c) => <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{c.isoCode2}</span>
          },
          {
            key: "name", header: "Nombre",
            render: (c) => <span className="font-medium text-gray-900">{c.name}</span>
          },
          {
            key: "currency", header: "Moneda",
            render: (c) => c.currency || "-"
          },
          {
            key: "status", header: "Estado",
            render: (c) => (
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                {c.isActive ? "Activo" : "Inactivo"}
              </span>
            )
          },
          {
            key: "actions", header: "Acciones", align: "right",
            render: (c) => (
              <button onClick={() => handleOpenEdit(c)} className="p-2 text-gray-400 hover:text-[#154734] transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            )
          }
        ]}
      />

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">{editingCountry ? "Editar País" : "Nuevo País"}</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#154734]" placeholder="Colombia" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISO Alpha-2 *</label>
                  <input required maxLength={2} type="text" value={formData.isoCode2} onChange={e => setFormData({ ...formData, isoCode2: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#154734]" placeholder="CO" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ISO Alpha-3 *</label>
                  <input required maxLength={3} type="text" value={formData.isoCode3} onChange={e => setFormData({ ...formData, isoCode3: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#154734]" placeholder="COL" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cód. Telefónico</label>
                  <input type="text" value={formData.phoneCode} onChange={e => setFormData({ ...formData, phoneCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#154734]" placeholder="+57" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <input type="text" maxLength={3} value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#154734]" placeholder="COP" />
                </div>
              </div>

              <label className="flex items-center space-x-2 mt-4 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-[#154734] focus:ring-[#154734]" />
                <span className="text-sm font-medium text-gray-700">País Activo</span>
              </label>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button type="submit" className="bg-[#154734] text-white hover:bg-[#113a29]">Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
