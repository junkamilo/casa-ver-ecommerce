"use client";

import { useMemo, useState } from "react";
import { Plus, Edit2, Map, Search } from "lucide-react";
import AdminDataTable from "@/components/ui/AdminDataTable";
import AdminPagination, { DEFAULT_ADMIN_PAGE_SIZE } from "@/components/ui/AdminPagination";
import type { DepartmentAdminDTO, CountryAdminDTO, CreateDepartmentInput } from "@/modules/geography/contracts/geography.dto";
import { Button } from "@/components/ui/button";
import AdminSelect from "@/components/ui/AdminSelect";

interface Props {
  departments: DepartmentAdminDTO[];
  countries: CountryAdminDTO[];
  onSave: (id: string | null, data: CreateDepartmentInput) => Promise<void>;
}

export default function DepartmentsManager({ departments, countries, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentAdminDTO | null>(null);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_ADMIN_PAGE_SIZE);

  const [formData, setFormData] = useState({
    name: "",
    daneCode: "",
    countryId: "",
    isActive: true,
  });

  const handleOpenNew = () => {
    setEditingDept(null);
    setFormData({
      name: "", daneCode: "", countryId: countries[0]?.id || "", isActive: true
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (d: DepartmentAdminDTO) => {
    setEditingDept(d);
    setFormData({
      name: d.name,
      daneCode: d.daneCode || "",
      countryId: d.countryId,
      isActive: d.isActive,
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(editingDept ? editingDept.id : null, {
      name: formData.name,
      daneCode: formData.daneCode || undefined,
      countryId: formData.countryId,
      isActive: formData.isActive,
    });
    setIsEditing(false);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return departments.filter((d) => {
      const matchesSearch = d.name.toLowerCase().includes(q);
      const matchesCountry = countryFilter ? d.countryId === countryFilter : true;
      return matchesSearch && matchesCountry;
    });
  }, [departments, search, countryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 py-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar departamento..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:border-[#154734] outline-none"
          />
        </div>
        <div className="w-full md:w-64">
          <AdminSelect
            value={countryFilter}
            onChange={(v) => {
              setCountryFilter(v);
              setPage(1);
            }}
            options={[
              { value: "", label: "Todos los países" },
              ...countries.map(c => ({ value: c.id, label: c.name }))
            ]}
          />
        </div>
        <div className="flex justify-between items-center">
          <Button onClick={handleOpenNew} className="bg-[#154734] text-white hover:bg-[#113a29]">
            <Plus className="w-4 h-4 mr-2" />
            Añadir Departamento
          </Button>
        </div>
      </div>

      <AdminDataTable
        data={paged}
        paginated
        rowKey={(d) => d.id}
        emptyState={{
          title: "No hay departamentos",
          description: "Agrega tu primer departamento.",
          icon: <Map className="w-6 h-6 text-[#154734]" />
        }}
        columns={[
          {
            key: "name", header: "Departamento",
            render: (d) => <span className="font-medium text-gray-900">{d.name}</span>
          },
          {
            key: "country", header: "País",
            render: (d) => d.countryName
          },
          {
            key: "dane", header: "DANE",
            render: (d) => d.daneCode || "-"
          },

          {
            key: "status", header: "Estado",
            render: (d) => (
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${d.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                {d.isActive ? "Activo" : "Inactivo"}
              </span>
            )
          },
          {
            key: "actions", header: "Acciones", align: "right",
            render: (d) => (
              <button onClick={() => handleOpenEdit(d)} className="p-2 text-gray-400 hover:text-[#154734] transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            )
          }
        ]}
        footer={
          <AdminPagination
            page={currentPage}
            totalPages={totalPages}
            total={filtered.length}
            pageSize={pageSize}
            itemLabel="departamentos"
            alwaysShow
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        }
      />

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">{editingDept ? "Editar Departamento" : "Nuevo Departamento"}</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País *</label>
                <AdminSelect
                  value={formData.countryId}
                  onChange={v => setFormData({ ...formData, countryId: v })}
                  options={countries.map(c => ({ value: c.id, label: c.name }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#154734]" placeholder="Antioquia" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código DANE (2 dígitos)</label>
                <input type="text" maxLength={2} value={formData.daneCode} onChange={e => setFormData({ ...formData, daneCode: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-xl outline-none focus:border-[#154734]" placeholder="05" />
              </div>

              <label className="flex items-center space-x-2 mt-4 cursor-pointer">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="rounded text-[#154734] focus:ring-[#154734]" />
                <span className="text-sm font-medium text-gray-700">Departamento Activo</span>
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
