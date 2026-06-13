"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createPromotionalCoupon,
  deactivatePromotionalCoupon,
  deletePromotionalCoupon,
  fetchPromotionalCouponUsages,
  fetchPromotionalCoupons,
} from "@/modules/adminCatalog/coupons/presentation/api-client";
import type {
  PromotionalCouponListItemDTO,
  PromotionalCouponUsageItemDTO,
} from "@/modules/adminCatalog/coupons/contracts/coupon.dto";
import { DEFAULT_ADMIN_PAGE_SIZE } from "@/components/ui/AdminPagination";
import { isDateBeforeTodayInBogota } from "@/modules/checkout/domain/coupon-schedule";

export type PromotionalCodeSource = "RANDOM" | "CUSTOM";
export type PromotionalScheduleMode = "SINGLE_DAY" | "DATE_RANGE";

export function usePromotionalCouponManager() {
  const [coupons, setCoupons] = useState<PromotionalCouponListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_ADMIN_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [codeSource, setCodeSourceState] = useState<PromotionalCodeSource>("RANDOM");
  const [customCode, setCustomCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [maxGlobalUses, setMaxGlobalUses] = useState(10);

  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<PromotionalScheduleMode>("SINGLE_DAY");
  const [singleDayDate, setSingleDayDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleDiscountValueChange = useCallback((value: string) => {
    setDiscountValue(value.replace(/\D/g, ""));
  }, []);

  const handleCustomCodeChange = useCallback((value: string) => {
    setCustomCode(value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 20));
  }, []);

  const handleCodeSourceChange = useCallback((source: PromotionalCodeSource) => {
    setCodeSourceState(source);
    if (source === "RANDOM") {
      setCustomCode("");
    }
  }, []);

  const handleMaxGlobalUsesChange = useCallback((value: string) => {
    const parsed = Number.parseInt(value, 10);
    setMaxGlobalUses(Number.isFinite(parsed) && parsed >= 1 ? parsed : 1);
  }, []);

  const resetScheduleFields = useCallback(() => {
    setScheduleEnabled(false);
    setScheduleMode("SINGLE_DAY");
    setSingleDayDate("");
    setStartTime("");
    setEndTime("");
    setFromDate("");
    setToDate("");
  }, []);

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [usagesModalOpen, setUsagesModalOpen] = useState(false);
  const [usages, setUsages] = useState<PromotionalCouponUsageItemDTO[]>([]);
  const [usagesCoupon, setUsagesCoupon] = useState<PromotionalCouponListItemDTO | null>(null);
  const [usagesLoading, setUsagesLoading] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    variant: "danger" | "warning";
    action: () => Promise<void>;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

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

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchPromotionalCoupons({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
      });
      setCoupons(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Error al cargar cupones");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, showToast]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const validateSchedule = (): string | null => {
    if (!scheduleEnabled) return null;

    if (scheduleMode === "SINGLE_DAY") {
      if (!singleDayDate) return "Selecciona el día de vigencia";
      if (isDateBeforeTodayInBogota(singleDayDate)) {
        return "La fecha no puede ser anterior a hoy";
      }
      if (!startTime) return "Ingresa la hora de inicio";
      if (!endTime) return "Ingresa la hora de fin";
      if (endTime <= startTime) return "La hora de fin debe ser posterior a la de inicio";
      return null;
    }

    if (!fromDate) return "Selecciona la fecha de inicio del rango";
    if (isDateBeforeTodayInBogota(fromDate)) {
      return "La fecha de inicio no puede ser anterior a hoy";
    }
    if (!toDate) return "Selecciona la fecha de fin del rango";
    if (toDate < fromDate) return "La fecha de fin debe ser igual o posterior a la de inicio";
    return null;
  };

  const handleCreate = async () => {
    const value = Number(discountValue);
    if (!discountValue || value <= 0) {
      showToast("error", "Ingresa un valor de descuento válido");
      return;
    }
    if (discountType === "PERCENTAGE" && (value < 1 || value > 100)) {
      showToast("error", "El porcentaje debe estar entre 1 y 100");
      return;
    }
    if (maxGlobalUses < 1) {
      showToast("error", "Los usos totales deben ser al menos 1");
      return;
    }
    if (codeSource === "CUSTOM") {
      if (!customCode.trim() || customCode.trim().length < 4) {
        showToast("error", "El nombre personalizado debe tener al menos 4 caracteres");
        return;
      }
    }

    const scheduleError = validateSchedule();
    if (scheduleError) {
      showToast("error", scheduleError);
      return;
    }

    setCreating(true);
    try {
      const result = await createPromotionalCoupon({
        codeSource,
        ...(codeSource === "CUSTOM" ? { code: customCode.trim() } : {}),
        discountType,
        discountValue: value,
        maxGlobalUses,
        scheduleEnabled,
        ...(scheduleEnabled
          ? scheduleMode === "SINGLE_DAY"
            ? {
                scheduleMode,
                singleDayDate,
                startTime,
                endTime,
              }
            : {
                scheduleMode,
                fromDate,
                toDate,
              }
          : {}),
      });
      showToast(
        "success",
        codeSource === "RANDOM"
          ? `Cupón ${result.code} generado automáticamente`
          : `Cupón ${result.code} creado`
      );
      setCustomCode("");
      setDiscountValue("");
      setCodeSourceState("RANDOM");
      resetScheduleFields();
      setPage(1);
      await loadCoupons();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Error al crear cupón");
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = (coupon: PromotionalCouponListItemDTO) => {
    setConfirmModal({
      title: "Desactivar cupón",
      description: `¿Desactivar el cupón ${coupon.code}? Los clientes no podrán usarlo hasta que lo reactives.`,
      confirmLabel: "Desactivar",
      variant: "warning",
      action: async () => {
        setActionId(coupon.id);
        try {
          await deactivatePromotionalCoupon(coupon.id);
          showToast("success", "Cupón desactivado");
          await loadCoupons();
        } catch (err) {
          showToast("error", err instanceof Error ? err.message : "Error al desactivar");
        } finally {
          setActionId(null);
        }
      },
    });
  };

  const handleDelete = (coupon: PromotionalCouponListItemDTO) => {
    if (coupon.currentGlobalUses > 0) return;
    setConfirmModal({
      title: "Eliminar cupón",
      description: `¿Eliminar el cupón ${coupon.code}? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      variant: "danger",
      action: async () => {
        setActionId(coupon.id);
        try {
          await deletePromotionalCoupon(coupon.id);
          showToast("success", "Cupón eliminado");
          await loadCoupons();
        } catch (err) {
          showToast("error", err instanceof Error ? err.message : "Error al eliminar");
        } finally {
          setActionId(null);
        }
      },
    });
  };

  const copyCode = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast("success", "Código copiado");
    } catch {
      showToast("error", "No se pudo copiar el código");
    }
  };

  const openUsages = async (coupon: PromotionalCouponListItemDTO) => {
    setUsagesModalOpen(true);
    setUsagesCoupon(coupon);
    setUsages([]);
    setUsagesLoading(true);
    try {
      const result = await fetchPromotionalCouponUsages(coupon.id);
      setUsages(result.usages);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Error al cargar usos");
      setUsagesModalOpen(false);
    } finally {
      setUsagesLoading(false);
    }
  };

  const closeUsages = () => {
    setUsagesModalOpen(false);
    setUsagesCoupon(null);
    setUsages([]);
  };

  const statusLabel: Record<PromotionalCouponListItemDTO["status"], string> = {
    ACTIVE: "Activo",
    EXHAUSTED: "Agotado",
    INACTIVE: "Inactivo",
    EXPIRED: "Expirado",
    SCHEDULED: "Programado",
  };

  const statusClass: Record<PromotionalCouponListItemDTO["status"], string> = {
    ACTIVE: "bg-emerald-100 text-emerald-800",
    EXHAUSTED: "bg-amber-100 text-amber-800",
    INACTIVE: "bg-gray-100 text-gray-600",
    EXPIRED: "bg-red-100 text-red-700",
    SCHEDULED: "bg-sky-100 text-sky-800",
  };

  const codeSourceLabel: Record<NonNullable<PromotionalCouponListItemDTO["codeSource"]>, string> = {
    RANDOM: "Aleatorio",
    CUSTOM: "Personalizado",
  };

  return {
    coupons,
    loading,
    creating,
    actionId,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    total,
    codeSource,
    setCodeSource: handleCodeSourceChange,
    customCode,
    setCustomCode: handleCustomCodeChange,
    discountType,
    setDiscountType,
    discountValue,
    setDiscountValue: handleDiscountValueChange,
    maxGlobalUses,
    setMaxGlobalUses: handleMaxGlobalUsesChange,
    scheduleEnabled,
    setScheduleEnabled,
    scheduleMode,
    setScheduleMode,
    singleDayDate,
    setSingleDayDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    toast,
    handleCreate,
    handleDeactivate,
    handleDelete,
    copyCode,
    usagesModalOpen,
    usages,
    usagesCoupon,
    usagesLoading,
    openUsages,
    closeUsages,
    statusLabel,
    statusClass,
    codeSourceLabel,
    confirmModal,
    confirmLoading,
    closeConfirmModal,
    runConfirmAction,
  };
}
