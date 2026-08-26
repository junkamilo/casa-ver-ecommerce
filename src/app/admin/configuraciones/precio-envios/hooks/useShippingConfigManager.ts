"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  fetchShippingConfig,
  updateShippingConfig,
  fetchShippingRates,
  createShippingRate,
  updateShippingRate,
  deleteShippingRate,
  assignRateZones,
  assignShippingCity,
  unassignShippingCity,
  AdminShippingApiError,
} from "@/modules/shipping/presentation/admin-shipping.api-client";
import {
  fetchAdminDepartments,
  fetchAdminMunicipalities,
} from "@/modules/geography/presentation/admin-geography.api-client";
import type { ShippingRateDTO } from "@/modules/shipping/contracts/shipping.dto";
import type { DepartmentAdminDTO, MunicipalityAdminDTO } from "@/modules/geography/contracts/geography.dto";
import { MESSAGES } from "../constants";

export function useShippingConfigManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rates, setRates] = useState<ShippingRateDTO[]>([]);
  const [departments, setDepartments] = useState<DepartmentAdminDTO[]>([]);
  // We'll load all municipalities up to a certain limit or let the user search.
  // For simplicity since it's a modal, let's load them and filter client-side if possible,
  // or provide search state. We'll load max 2000 municipalities (all of Colombia has ~1123).
  const [municipalities, setMunicipalities] = useState<MunicipalityAdminDTO[]>([]);

  const [defaultRateId, setDefaultRateId] = useState<string | null>(null);

  const [freeShippingMinSubtotal, setFreeShippingMinSubtotal] = useState("0");
  const [initialThreshold, setInitialThreshold] = useState("0");
  const [initialDefaultRate, setInitialDefaultRate] = useState<string | null>(null);
  
  const dirty = freeShippingMinSubtotal !== initialThreshold || defaultRateId !== initialDefaultRate;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [config, ratesList, deptsList, munisPage] = await Promise.all([
        fetchShippingConfig(), 
        fetchShippingRates(),
        fetchAdminDepartments(),
        fetchAdminMunicipalities(1, 2000) 
      ]);
      const threshold = String(config.freeShippingThreshold);
      setFreeShippingMinSubtotal(threshold);
      setInitialThreshold(threshold);
      setDefaultRateId(config.defaultRateId || null);
      setInitialDefaultRate(config.defaultRateId || null);
      setRates(ratesList);
      setDepartments(deptsList);
      setMunicipalities(munisPage.data);
    } catch (error) {
      const message = error instanceof AdminShippingApiError ? error.message : MESSAGES.loadError;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleReset = useCallback(() => {
    setFreeShippingMinSubtotal(initialThreshold);
    setDefaultRateId(initialDefaultRate);
    toast.success(MESSAGES.resetSuccess);
  }, [initialThreshold, initialDefaultRate]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const threshold = parseInt(freeShippingMinSubtotal || "0", 10) || 0;
      await updateShippingConfig({ 
        freeShippingThreshold: threshold,
        defaultRateId: defaultRateId || undefined 
      });
      setInitialThreshold(String(threshold));
      setInitialDefaultRate(defaultRateId);
      toast.success("Configuración guardada exitosamente");
    } catch (error) {
      toast.error(error instanceof AdminShippingApiError ? error.message : MESSAGES.saveError);
    } finally {
      setSaving(false);
    }
  }, [freeShippingMinSubtotal, defaultRateId]);

  const handleSaveConfig = useCallback(async (updates: { freeShippingMinSubtotal?: string, defaultRateId?: string | null }) => {
    setSaving(true);
    try {
      const threshold = parseInt((updates.freeShippingMinSubtotal ?? freeShippingMinSubtotal) || "0", 10) || 0;
      const defRateId = updates.defaultRateId !== undefined ? updates.defaultRateId : defaultRateId;
      
      await updateShippingConfig({ 
        freeShippingThreshold: threshold,
        defaultRateId: defRateId || undefined 
      });
      
      if (updates.freeShippingMinSubtotal !== undefined) {
        setFreeShippingMinSubtotal(String(threshold));
        setInitialThreshold(String(threshold));
        toast.success(MESSAGES.saveSuccess);
      }
      if (updates.defaultRateId !== undefined) {
        setDefaultRateId(defRateId);
        setInitialDefaultRate(defRateId);
        if (updates.freeShippingMinSubtotal === undefined) {
          toast.success("Tarifa nacional configurada correctamente");
        }
      }
      return true;
    } catch (error) {
      toast.error(error instanceof AdminShippingApiError ? error.message : MESSAGES.saveError);
      return false;
    } finally {
      setSaving(false);
    }
  }, [freeShippingMinSubtotal, defaultRateId]);

  const handleSaveRate = useCallback(async (id: string | null, name: string, price: number, municipalityIds: string[]) => {
    try {
      let rateId = id;
      const rateName = name.trim() || undefined;
      
      if (id) {
        await updateShippingRate(id, { name: rateName, price });
        toast.success(MESSAGES.rateUpdateSuccess);
      } else {
        const newRate = await createShippingRate({ name: rateName, price });
        rateId = newRate.id;
        toast.success(MESSAGES.rateCreateSuccess);
      }
      
      if (rateId && municipalityIds.length > 0) {
        await assignRateZones(rateId, municipalityIds);
        toast.success("Zonas de la tarifa actualizadas");
      }
      
      await load();
      return rateId;
    } catch (error) {
      toast.error(error instanceof AdminShippingApiError ? error.message : "Error al guardar tarifa");
    }
  }, [load]);

  const handleDeleteRate = useCallback(async (id: string) => {
    try {
      await deleteShippingRate(id);
      setRates((prev) => prev.filter((r) => r.id !== id));
      toast.success(MESSAGES.rateDeleteSuccess);
    } catch (error) {
      toast.error(error instanceof AdminShippingApiError ? error.message : MESSAGES.rateDeleteError);
    }
  }, []);

  const handleAssignMunicipality = useCallback(async (municipalityId: string, rateId: string | null) => {
    try {
      if (rateId) {
        await assignShippingCity(municipalityId, rateId);
        toast.success("Municipio asignado a la tarifa (Excepción creada)");
      } else {
        await unassignShippingCity(municipalityId);
        toast.success("Municipio desasignado de la tarifa (usará la tarifa nacional)");
      }
      await load();
    } catch (error) {
      toast.error(error instanceof AdminShippingApiError ? error.message : "Error al asignar municipio");
    }
  }, [load]);

  const previewValues = useMemo(
    () => ({
      rates,
      freeShippingMinSubtotal: parseInt(freeShippingMinSubtotal || "0", 10) || 0,
      defaultRateId,
    }),
    [rates, freeShippingMinSubtotal, defaultRateId]
  );

  return {
    loading,
    saving,
    rates,
    freeShippingMinSubtotal,
    setFreeShippingMinSubtotal,
    defaultRateId,
    setDefaultRateId,
    dirty,
    previewValues,
    departments,
    municipalities,
    handleSave,
    handleSaveConfig,
    handleReset,
    handleSaveRate,
    handleDeleteRate,
    handleAssignMunicipality,
    reload: load,
  };
}
