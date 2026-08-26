"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { Loader2 } from "lucide-react";
import { useGeographyManager } from "./hooks/useGeographyManager";
import CountriesManager from "./components/CountriesManager";
import DepartmentsManager from "./components/DepartmentsManager";
import MunicipalitiesManager from "./components/MunicipalitiesManager";

export default function CiudadesEnviosPage() {
  const m = useGeographyManager();
  const [activeTab, setActiveTab] = useState<"countries" | "departments" | "municipalities">("countries");

  return (
    <div className="space-y-8 pb-10">
      <AdminPageHeader
        title="Geografía y Tarifas de Envío"
      />

      {/* TABS */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("countries")}
            className={`${activeTab === "countries"
              ? "border-[#154734] text-[#154734]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Países
          </button>
          <button
            onClick={() => setActiveTab("departments")}
            className={`${activeTab === "departments"
              ? "border-[#154734] text-[#154734]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Departamentos
          </button>
          <button
            onClick={() => setActiveTab("municipalities")}
            className={`${activeTab === "municipalities"
              ? "border-[#154734] text-[#154734]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Municipios
          </button>
        </nav>
      </div>

      {m.loading && m.countries.length === 0 ? (
        <div className="flex items-center justify-center py-24 text-[#154734]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="mt-6">
          {activeTab === "countries" && (
            <CountriesManager
              countries={m.countries}
              onSave={m.handleSaveCountry}
            />
          )}
          {activeTab === "departments" && (
            <DepartmentsManager
              departments={m.departments}
              countries={m.countries}
              onSave={m.handleSaveDepartment}
            />
          )}
          {activeTab === "municipalities" && (
            <MunicipalitiesManager
              pageData={m.municipalitiesPage}
              departments={m.departments}
              rates={m.rates}
              defaultRateId={m.defaultRateId}
              search={m.muniSearch}
              onSearchChange={m.setMuniSearch}
              departmentFilter={m.muniDepartmentId}
              onDepartmentFilterChange={m.setMuniDepartmentId}
              onPageChange={m.setMuniPage}
              onPageSizeChange={m.setMuniPageSize}
              onSave={m.handleSaveMunicipality}
            />
          )}
        </div>
      )}
    </div>
  );
}
