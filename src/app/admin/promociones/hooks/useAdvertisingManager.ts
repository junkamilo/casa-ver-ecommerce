"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createPromoPopup,
  deletePromoPopup,
  fetchPromoPopups,
  togglePromoPopupActive,
  updatePromoPopup,
} from "@/modules/adminCatalog/promoPopups/presentation/api-client";
import type { PromoPopupListItemDTO } from "@/modules/adminCatalog/promoPopups/contracts/promo-popup.dto";
import {
  ADVERTISING_DEFAULT_FORM,
  type AdvertisingFormState,
} from "../constants/advertising-defaults";

export type AdvertisingScheduleMode = "SINGLE_DAY" | "DATE_RANGE";

function buildPayload(form: AdvertisingFormState) {
  return {
    name: form.name.trim(),
    placement: form.placement,
    isActive: form.isActive,
    headline: form.headline.trim(),
    subtitle: form.subtitle.trim(),
    couponCode: form.couponCode.trim(),
    disclaimer: form.disclaimer.trim(),
    ctaText: form.ctaText.trim(),
    ctaUrl: form.ctaUrl.trim(),
    delaySeconds: form.delaySeconds,
    scheduleEnabled: form.scheduleEnabled,
    scheduleMode: form.scheduleEnabled ? form.scheduleMode : undefined,
    singleDayDate:
      form.scheduleEnabled && form.scheduleMode === "SINGLE_DAY" ? form.singleDayDate : undefined,
    startTime:
      form.scheduleEnabled && form.scheduleMode === "SINGLE_DAY" ? form.startTime : undefined,
    endTime: form.scheduleEnabled && form.scheduleMode === "SINGLE_DAY" ? form.endTime : undefined,
    fromDate:
      form.scheduleEnabled && form.scheduleMode === "DATE_RANGE" ? form.fromDate : undefined,
    toDate: form.scheduleEnabled && form.scheduleMode === "DATE_RANGE" ? form.toDate : undefined,
  };
}

function formFromItem(item: PromoPopupListItemDTO): AdvertisingFormState {
  return {
    name: item.name,
    placement: item.placement,
    isActive: item.isActive,
    headline: item.headline,
    subtitle: item.subtitle,
    couponCode: item.couponCode,
    disclaimer: item.disclaimer,
    ctaText: item.ctaText,
    ctaUrl: item.ctaUrl,
    delaySeconds: item.delaySeconds,
    scheduleEnabled: item.scheduleLabel !== "Sin límite",
    scheduleMode: "SINGLE_DAY",
    singleDayDate: "",
    startTime: "",
    endTime: "",
    fromDate: "",
    toDate: "",
  };
}

export function useAdvertisingManager() {
  const [items, setItems] = useState<PromoPopupListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSeed, setFormSeed] = useState<AdvertisingFormState>(ADVERTISING_DEFAULT_FORM);
  const [formSeedKey, setFormSeedKey] = useState(0);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    variant: "danger" | "warning";
    action: () => Promise<void>;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const bumpFormSeed = useCallback((next: AdvertisingFormState) => {
    setFormSeed(next);
    setFormSeedKey((k) => k + 1);
  }, []);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchPromoPopups();
      setItems(result.data);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Error al cargar publicidad");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const resetForm = useCallback(() => {
    setEditingId(null);
    bumpFormSeed(ADVERTISING_DEFAULT_FORM);
  }, [bumpFormSeed]);

  const startEdit = useCallback(
    (item: PromoPopupListItemDTO) => {
      setEditingId(item.id);
      bumpFormSeed(formFromItem(item));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [bumpFormSeed]
  );

  const handleSave = useCallback(
    async (form: AdvertisingFormState) => {
      setSaving(true);
      try {
        const payload = buildPayload(form);
        if (editingId) {
          await updatePromoPopup({ ...payload, id: editingId });
          showToast("success", "Publicidad actualizada");
        } else {
          await createPromoPopup(payload);
          showToast("success", "Publicidad creada");
        }
        resetForm();
        await loadItems();
      } catch (err) {
        showToast("error", err instanceof Error ? err.message : "Error al guardar");
      } finally {
        setSaving(false);
      }
    },
    [editingId, loadItems, resetForm, showToast]
  );

  const handleToggleActive = useCallback(
    async (item: PromoPopupListItemDTO) => {
      setActionId(item.id);
      try {
        await togglePromoPopupActive(item.id, !item.isActive);
        showToast("success", item.isActive ? "Publicidad desactivada" : "Publicidad activada");
        await loadItems();
      } catch (err) {
        showToast("error", err instanceof Error ? err.message : "Error al cambiar estado");
      } finally {
        setActionId(null);
      }
    },
    [loadItems, showToast]
  );

  const handleDelete = useCallback(
    (item: PromoPopupListItemDTO) => {
      setConfirmModal({
        title: "Eliminar publicidad",
        description: `¿Eliminar "${item.name}"? Esta acción no se puede deshacer.`,
        confirmLabel: "Eliminar",
        variant: "danger",
        action: async () => {
          setActionId(item.id);
          try {
            await deletePromoPopup(item.id);
            if (editingId === item.id) resetForm();
            showToast("success", "Publicidad eliminada");
            await loadItems();
          } catch (err) {
            showToast("error", err instanceof Error ? err.message : "Error al eliminar");
          } finally {
            setActionId(null);
          }
        },
      });
    },
    [editingId, loadItems, resetForm, showToast]
  );

  const copyCode = useCallback(
    async (code: string) => {
      try {
        await navigator.clipboard.writeText(code);
        showToast("success", "Código copiado");
      } catch {
        showToast("error", "No se pudo copiar el código");
      }
    },
    [showToast]
  );

  const closeConfirmModal = useCallback(() => {
    if (confirmLoading) return;
    setConfirmModal(null);
  }, [confirmLoading]);

  const runConfirmAction = useCallback(async () => {
    if (!confirmModal) return;
    setConfirmLoading(true);
    try {
      await confirmModal.action();
      setConfirmModal(null);
    } finally {
      setConfirmLoading(false);
    }
  }, [confirmModal]);

  return {
    items,
    loading,
    saving,
    actionId,
    editingId,
    formSeed,
    formSeedKey,
    toast,
    confirmModal,
    confirmLoading,
    handleSave,
    handleToggleActive,
    handleDelete,
    startEdit,
    resetForm,
    copyCode,
    closeConfirmModal,
    runConfirmAction,
  };
}
