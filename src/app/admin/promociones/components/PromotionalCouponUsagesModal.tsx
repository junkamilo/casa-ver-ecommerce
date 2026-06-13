"use client";

import type { PromotionalCouponUsageItemDTO } from "@/modules/adminCatalog/coupons/contracts/coupon.dto";
import { Loader2, X } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  isOpen: boolean;
  loading: boolean;
  couponCode: string | null;
  usages: PromotionalCouponUsageItemDTO[];
  onClose: () => void;
};

export default function PromotionalCouponUsagesModal({
  isOpen,
  loading,
  couponCode,
  usages,
  onClose,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Historial de usos</h3>
            {couponCode ? (
              <p className="text-sm text-gray-500 font-mono mt-0.5">{couponCode}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[#154734]" />
            </div>
          ) : usages.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Este cupón aún no ha sido utilizado.
            </p>
          ) : (
            <div className="space-y-3">
              {usages.map((usage) => (
                <div
                  key={usage.id}
                  className="rounded-xl border border-gray-100 bg-gray-50/80 p-4 text-sm space-y-1"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900">{usage.orderNumber}</span>
                    <span className="text-xs text-gray-500">{formatDate(usage.usedAt)}</span>
                  </div>
                  <p className="text-gray-600">{usage.email}</p>
                  <p className="text-gray-500">Cédula: {usage.documentId}</p>
                  <p className="text-xs font-medium text-[#154734]">{usage.orderStatus}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
