"use client";

import { useState } from "react";
import { Plus, Edit2, Search, MapPin } from "lucide-react";
import AdminDataTable from "@/components/ui/AdminDataTable";
import AdminPagination from "@/components/ui/AdminPagination";
import AdminSelect from "@/components/ui/AdminSelect";
import type { MunicipalityAdminDTO, DepartmentAdminDTO, PaginatedResult, CreateMunicipalityInput } from "@/modules/geography/contracts/geography.dto";
import type { ShippingRateDTO } from "@/modules/shipping/contracts/shipping.dto";
import { Button } from "@/components/ui/button";

interface Props {
  pageData: PaginatedResult<MunicipalityAdminDTO>;
  departments: DepartmentAdminDTO[];
  rates: ShippingRateDTO[];
  defaultRateId: string | null;
  search: string;
  onSearchChange: (v: string) => void;
  departmentFilter: string;
  onDepartmentFilterChange: (v: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSave: (id: string | null, data: CreateMunicipalityInput) => Promise<void>;
}

export default function MunicipalitiesManager({
  pageData,
  departments,
  rates,
  defaultRateId,
  search,
  onSearchChange,
  departmentFilter,
  onDepartmentFilterChange,
  onPageChange,
  onPageSizeChange,
  onSave,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingMuni, setEditingMuni] = useState<MunicipalityAdminDTO | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    daneCode: "",
    departmentId: "",
    isActive: true,
  });

  const handleOpenNew = () => {
    setEditingMuni(null);
    setFormData({
      name: "", daneCode: "", departmentId: departments[0]?.id || "", isActive: true
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (m: MunicipalityAdminDTO) => {
    setEditingMuni(m);
    setFormData({
      name: m.name,
      daneCode: m.daneCode || "",
      departmentId: m.departmentId,
      isActive: m.isActive,
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(editingMuni ? editingMuni.id : null, {
      name: formData.name,
      daneCode: formData.daneCode || undefined,
      departmentId: formData.departmentId,
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
            placeholder="Buscar municipio..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#154734] outline-none"
          />
        </div>
        <div className="w-full md:w-64">
          <AdminSelect
            value={departmentFilter}
            onChange={onDepartmentFilterChange}
            options={[
              { value: "", label: "Todos los departamentos" },
              ...departments.map(d => ({ value: d.id, label: d.name }))
            ]}
          />
        </div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <Button onClick={handleOpenNew} className="bg-[#154734] text-white hover:bg-[#113a29] whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Añadir Municipio
          </Button>
        </div>
      </div>

      <AdminDataTable
        data={pageData.data}
        paginated
        rowKey={(m) => m.id}
        emptyState={{
          title: "No se encontraron municipios",
          description: "Prueba ajustando los filtros de búsqueda.",
          icon: <MapPin className="w-6 h-6 text-[#154734]" />
        }}
        columns={[
          {
            key: "name", header: "Municipio",
            render: (m) => <span className="font-medium text-gray-900">{m.name}</span>
          },
          {
            key: "department", header: "Departamento",
            render: (m) => <span className="text-gray-600">{m.departmentName}</span>
          },
          {
            key: "dane", header: "DANE",
            render: (m) => m.daneCode || "-"
          },
          {
            key: "rate", header: "Tarifa",
            render: (m) => {
              const assignedRate = m.shippingRateId ? rates.find(r => r.id === m.shippingRateId) : null;
              const nationalRate = defaultRateId ? rates.find(r => r.id === defaultRateId) : null;
              
              if (assignedRate) {
                return (
                  <div className="flex flex-col">
                    <span className="font-semibold text-[#154734]">{assignedRate.name || "Tarifa Especial"}</span>
                    <span className="text-xs text-gray-500">${assignedRate.price.toLocaleString("es-CO")}</span>
                  </div>
                );
              }
              
              if (nationalRate) {
                return (
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-600">Tarifa Nacional</span>
                    <span className="text-xs text-gray-400">${nationalRate.price.toLocaleString("es-CO")}</span>
                  </div>
                );
              }

              return <span className="text-gray-400 italic text-sm">Sin tarifa</span>;
            }
          },
          {
            key: "actions", header: "Acciones", align: "right",
            render: (m) => (
              <button onClick={() => handleOpenEdit(m)} className="p-2 text-gray-400 hover:text-[#154734] transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            )
          }
        ]}
        footer={
          <AdminPagination
            page={pageData.page}
            totalPages={pageData.totalPages}
            total={pageData.total}
            pageSize={pageData.pageSize}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        }
      />

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">{editingMuni ? "Editar Municipio" : "Nuevo Municipio"}</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento *</label>
                <AdminSelect
                  value={formData.departmentId}
                  onChange={v => setFormData({ ...formData, departmentId: v })}
                  options={departments.map(d => ({ value: d.id, label: d.name }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#154734]" placeholder="Medellín" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código DANE (5 dígitos)</label>
                <input type="text" maxLength={5} value={formData.daneCode} onChange={e => setFormData({ ...formData, daneCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#154734]" placeholder="05001" />
              </div>

              <label className="flex items-center space-x-2 mt-4 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-[#154734] focus:ring-[#154734]" />
                <span className="text-sm font-medium text-gray-700">Municipio Activo</span>
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
