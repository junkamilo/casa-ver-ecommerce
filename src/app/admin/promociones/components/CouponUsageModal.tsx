"use client";

import { useRouter } from "next/navigation";
import {
  X,
  User,
  TicketPercent,
  MapPin,
  CreditCard,
  Calendar,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { CouponUsageDetailDTO } from "@/modules/adminCatalog/coupons/contracts/coupon.dto";

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

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
  detail: CouponUsageDetailDTO | null;
  onClose: () => void;
};

export default function CouponUsageModal({ isOpen, loading, detail, onClose }: Props) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2
              className="text-lg font-bold text-[#154734]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Cupón utilizado
            </h2>
            <p className="text-xs text-gray-500">
              {detail?.coupon.code ?? "Cargando..."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 bg-gray-50/30 flex-1">
          {loading || !detail ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
            </div>
          ) : (
            <>
              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
                <div className="flex items-center gap-2 text-[#154734]">
                  <TicketPercent className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wide">Cupón</h3>
                </div>
                <p className="font-mono text-sm font-semibold">{detail.coupon.code}</p>
                <p className="text-sm text-gray-600">
                  Descuento: <span className="font-semibold">{detail.coupon.discountPercentage}%</span>
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Usado el {formatDate(detail.coupon.usedAt)}
                </p>
              </section>

              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-[#154734]">
                  <User className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wide">Comprador</h3>
                </div>
                <div className="space-y-1.5 text-sm">
                  <p><span className="text-gray-500">Nombre:</span> {detail.customer.name}</p>
                  <p><span className="text-gray-500">Email:</span> {detail.customer.email}</p>
                  <p><span className="text-gray-500">Teléfono:</span> {detail.customer.phone}</p>
                  {detail.customer.cedula && (
                    <p><span className="text-gray-500">Cédula:</span> {detail.customer.cedula}</p>
                  )}
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600 pt-1">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-gray-400" />
                  <p>
                    {detail.customer.address}, {detail.customer.city},{" "}
                    {detail.customer.department}
                  </p>
                </div>
              </section>

              <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                <div className="flex items-center gap-2 text-[#154734]">
                  <CreditCard className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wide">Orden</h3>
                </div>
                <div className="space-y-1.5 text-sm">
                  <p>
                    <span className="text-gray-500">Nº orden:</span>{" "}
                    <span className="font-mono font-semibold">{detail.order.orderNumber}</span>
                  </p>
                  <p><span className="text-gray-500">Estado:</span> {detail.order.status}</p>
                  <p><span className="text-gray-500">Pago:</span> {detail.order.paymentMethod}</p>
                  <p className="text-xs text-gray-500">
                    Creada el {formatDate(detail.order.createdAt)}
                  </p>
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatPrice(detail.order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Envío</span>
                    <span>{formatPrice(detail.order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>Descuento cupón</span>
                    <span>-{formatPrice(detail.order.discount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#154734] pt-1">
                    <span>Total</span>
                    <span>{formatPrice(detail.order.total)}</span>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>

        {detail && !loading && (
          <div className="px-6 py-4 border-t border-gray-100 bg-white">
            <button
              type="button"
              onClick={() => {
                router.push(`/admin/pedidos?abrir=${encodeURIComponent(detail.order.orderNumber)}`);
                onClose();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#154734] text-white text-sm font-semibold rounded-xl hover:bg-[#154734]/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver pedido en Pedidos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
