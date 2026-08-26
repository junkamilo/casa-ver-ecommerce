"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchAdminCountries,
  createAdminCountry,
  updateAdminCountry,
  fetchAdminDepartments,
  createAdminDepartment,
  updateAdminDepartment,
  fetchAdminMunicipalities,
  createAdminMunicipality,
  updateAdminMunicipality,
} from "@/modules/geography/presentation/admin-geography.api-client";
import {
  fetchShippingRates,
  assignShippingCity,
  unassignShippingCity,
} from "@/modules/shipping/presentation/admin-shipping.api-client";
import type {
  CountryAdminDTO,
  DepartmentAdminDTO,
  MunicipalityAdminDTO,
  PaginatedResult,
  CreateCountryInput,
  CreateDepartmentInput,
  CreateMunicipalityInput,
} from "@/modules/geography/contracts/geography.dto";
import type { ShippingRateDTO } from "@/modules/shipping/contracts/shipping.dto";
import { fetchShippingConfig } from "@/modules/shipping/presentation/admin-shipping.api-client";

export function useGeographyManager() {
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [countries, setCountries] = useState<CountryAdminDTO[]>([]);
  const [departments, setDepartments] = useState<DepartmentAdminDTO[]>([]);
  const [municipalitiesPage, setMunicipalitiesPage] = useState<PaginatedResult<MunicipalityAdminDTO>>({
    data: [], page: 1, pageSize: 50, total: 0, totalPages: 0
  });
  const [rates, setRates] = useState<ShippingRateDTO[]>([]);
  const [defaultRateId, setDefaultRateId] = useState<string | null>(null);

  // Filters for Municipalities
  const [muniSearch, setMuniSearchState] = useState("");
  const [muniDepartmentId, setMuniDepartmentIdState] = useState<string>("");
  const [muniPage, setMuniPage] = useState(1);
  const [muniPageSize, setMuniPageSize] = useState(50);

  // Al cambiar búsqueda/filtro, volver a página 1 para que el resultado no quede vacío
  const setMuniSearch = useCallback((value: string) => {
    setMuniSearchState(value);
    setMuniPage(1);
  }, []);

  const setMuniDepartmentId = useCallback((value: string) => {
    setMuniDepartmentIdState(value);
    setMuniPage(1);
  }, []);

  const loadBaseData = useCallback(async () => {
    setLoading(true);
    try {
      const [countriesList, departmentsList, ratesList, config] = await Promise.all([
        fetchAdminCountries(),
        fetchAdminDepartments(),
        fetchShippingRates(),
        fetchShippingConfig(),
      ]);
      setCountries(countriesList);
      setDepartments(departmentsList);
      setRates(ratesList);
      setDefaultRateId(config.defaultRateId || null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error cargando datos base");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMunicipalities = useCallback(async () => {
    try {
      const result = await fetchAdminMunicipalities(muniPage, muniPageSize, muniDepartmentId, muniSearch);
      setMunicipalitiesPage(result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error cargando municipios");
    }
  }, [muniPage, muniPageSize, muniDepartmentId, muniSearch]);

  useEffect(() => {
    void loadBaseData();
  }, [loadBaseData]);

  useEffect(() => {
    void loadMunicipalities();
  }, [loadMunicipalities]);

  // Actions for Countries
  const handleSaveCountry = async (id: string | null, data: CreateCountryInput) => {
    try {
      if (id) {
        await updateAdminCountry(id, data);
        toast.success("País actualizado");
      } else {
        await createAdminCountry(data);
        toast.success("País creado");
      }
      await loadBaseData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error guardando país");
      throw error;
    }
  };

  // Actions for Departments
  const handleSaveDepartment = async (id: string | null, data: CreateDepartmentInput) => {
    try {
      if (id) {
        await updateAdminDepartment(id, data);
        toast.success("Departamento actualizado");
      } else {
        await createAdminDepartment(data);
        toast.success("Departamento creado");
      }
      await loadBaseData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error guardando departamento");
      throw error;
    }
  };



  // Actions for Municipalities
  const handleSaveMunicipality = async (id: string | null, data: CreateMunicipalityInput) => {
    try {
      if (id) {
        await updateAdminMunicipality(id, data);
        toast.success("Municipio actualizado");
      } else {
        await createAdminMunicipality(data);
        toast.success("Municipio creado");
      }
      await loadMunicipalities();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error guardando municipio");
      throw error;
    }
  };

  const handleAssignMunicipalityRate = async (municipalityId: string, rateId: string | null) => {
    try {
      if (rateId) {
        await assignShippingCity(municipalityId, rateId);
        toast.success("Tarifa excepcional asignada al municipio");
      } else {
        await unassignShippingCity(municipalityId);
        toast.success("Tarifa del municipio restablecida (usará la tarifa nacional)");
      }
      await loadMunicipalities(); // We need to refresh to see the rate. Wait, my fetchAdminMunicipalities doesn't return the assigned rate directly? 
      // Actually, wait, the Admin API for municipalities doesn't include the shipping rate right now? Let's check that later.
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error actualizando tarifa del municipio");
    }
  };

  return {
    loading,
    countries,
    departments,
    rates,
    defaultRateId,
    municipalitiesPage,
    muniSearch,
    setMuniSearch,
    muniDepartmentId,
    setMuniDepartmentId,
    muniPage,
    setMuniPage,
    muniPageSize,
    setMuniPageSize,
    handleSaveCountry,
    handleSaveDepartment,
    handleSaveMunicipality,
    handleAssignMunicipalityRate,
    reload: loadBaseData,
  };
}
