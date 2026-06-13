"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteAdminCoupon,
  fetchAdminCoupons,
  fetchCouponUsageDetail,
  generateAdminCoupons,
} from "@/modules/adminCatalog/coupons/presentation/api-client";
import type {
  CouponListItemDTO,
  CouponUsageDetailDTO,
} from "@/modules/adminCatalog/coupons/contracts/coupon.dto";
import { DEFAULT_ADMIN_PAGE_SIZE } from "@/components/ui/AdminPagination";

export function useCouponManager() {
  const [coupons, setCoupons] = useState<CouponListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_ADMIN_PAGE_SIZE);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [discountPercentage, setDiscountPercentageRaw] = useState("");
  const [quantity, setQuantity] = useState(10);

  const setDiscountPercentage = useCallback((value: string) => {
    setDiscountPercentageRaw(value.replace(/\D/g, ""));
  }, []);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [usageDetail, setUsageDetail] = useState<CouponUsageDetailDTO | null>(null);
  const [usageLoading, setUsageLoading] = useState(false);

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
      const result = await fetchAdminCoupons({
        page,
        limit: pageSize,
        search: search.trim() || undefined,
      });
      setCoupons(result.data);
      setTotalPages(result.pagination.totalPages);
      setTotal(result.pagination.total);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar cupones";
      showToast("error", message);
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

  const handleGenerate = async () => {
    const discount = Number(discountPercentage);
    if (!discountPercentage || discount < 1 || discount > 100) {
      showToast("error", "El descuento debe ser un número entre 1 y 100");
      return;
    }

    if (quantity < 1 || quantity > 100) {
      showToast("error", "La cantidad debe estar entre 1 y 100");
      return;
    }

    setGenerating(true);
    try {
      const result = await generateAdminCoupons({ discountPercentage: discount, quantity });
      showToast("success", `${result.coupons.length} cupones generados al ${discount}%`);
      setPage(1);
      await loadCoupons();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al generar cupones";
      showToast("error", message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (coupon: CouponListItemDTO) => {
    if (coupon.isUsed) return;
    if (!confirm(`¿Eliminar el cupón ${coupon.code}?`)) return;

    setDeletingId(coupon.id);
    try {
      await deleteAdminCoupon(coupon.id);
      showToast("success", "Cupón eliminado");
      await loadCoupons();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al eliminar cupón";
      showToast("error", message);
    } finally {
      setDeletingId(null);
    }
  };

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast("success", "Código copiado");
    } catch {
      showToast("error", "No se pudo copiar el código");
    }
  };

  const openUsageDetail = async (coupon: CouponListItemDTO) => {
    if (!coupon.isUsed) return;
    setUsageModalOpen(true);
    setUsageDetail(null);
    setUsageLoading(true);
    try {
      const detail = await fetchCouponUsageDetail(coupon.id);
      setUsageDetail(detail);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar el detalle";
      showToast("error", message);
      setUsageModalOpen(false);
    } finally {
      setUsageLoading(false);
    }
  };

  const closeUsageDetail = () => {
    setUsageModalOpen(false);
    setUsageDetail(null);
  };

  const usedRowClass =
    "bg-emerald-50/70 hover:bg-emerald-100/60 border-l-4 border-l-[#154734]";

  return {
    coupons,
    loading,
    generating,
    deletingId,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    total,
    discountPercentage,
    setDiscountPercentage,
    quantity,
    setQuantity,
    toast,
    handleGenerate,
    handleDelete,
    copyCode,
    usageModalOpen,
    usageDetail,
    usageLoading,
    openUsageDetail,
    closeUsageDetail,
    usedRowClass,
  };
}
