"use client";

import {
  X, Package, MapPin, Truck, CheckCircle2, AlertCircle,
  CreditCard, Clock, Circle,
} from "lucide-react";
import { OrderDetailModalProps, OrderStatus } from "../types";
import { formatOrderDate, formatOrderPrice } from "../constants";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderItemRow } from "./OrderItemRow";
import { useOrderDelivery } from "../hooks/useOrderDelivery";

// ── Timeline de estados ───────────────────────────────────────────────────────

const TIMELINE_STEPS: { status: OrderStatus; label: string; dateKey: "createdAt" | "paidAt" | "shippedAt" | "deliveredAt" }[] = [
  { status: "PENDING",   label: "Pedido recibido",  dateKey: "createdAt" },
  { status: "PAID",      label: "Pago confirmado",   dateKey: "paidAt" },
  { status: "SHIPPED",   label: "En camino",         dateKey: "shippedAt" },
  { status: "DELIVERED", label: "Entregado",         dateKey: "deliveredAt" },
];

const STATUS_WEIGHT: Record<OrderStatus, number> = {
  PENDING:    1,
  PROCESSING: 1,
  PAID:       2,
  SHIPPED:    3,
  DELIVERED:  4,
  CANCELLED:  0,
  FAILED:     0,
  REFUNDED:   0,
};

function OrderTimeline({ order }: { order: { status: OrderStatus; createdAt: string; paidAt: string | null; shippedAt: string | null; deliveredAt: string | null } }) {
  const currentWeight = STATUS_WEIGHT[order.status] ?? 0;
  const isCancelled = order.status === "CANCELLED" || order.status === "FAILED" || order.status === "REFUNDED";

  if (isCancelled) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Estado del pedido
      </h3>
      <div className="relative pl-5">
        {TIMELINE_STEPS.map((step, i) => {
          const stepWeight = STATUS_WEIGHT[step.status];
          const done = currentWeight >= stepWeight;
          const active = order.status === step.status || (step.status === "PENDING" && currentWeight >= 1);
          const dateValue = order[step.dateKey];

          return (
            <div key={step.status} className="relative pb-4 last:pb-0">
              {/* Línea vertical */}
              {i < TIMELINE_STEPS.length - 1 && (
                <span
                  className={`absolute -left-3.25 top-4 bottom-0 w-0.5 ${done ? "bg-[#154734]" : "bg-gray-200"}`}
                />
              )}
              {/* Dot */}
              <span className="absolute -left-4.25 top-1">
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-[#154734]" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300" />
                )}
              </span>
              <div className={`text-xs ${done ? "text-gray-900" : "text-gray-400"}`}>
                <span className={`font-semibold ${active && !done ? "text-[#154734]" : ""}`}>
                  {step.label}
                </span>
                {dateValue && (
                  <span className="ml-2 text-gray-400">{formatOrderDate(dateValue)}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Desglose de precios ───────────────────────────────────────────────────────

function PriceBreakdown({ subtotal, shippingCost, discount, total }: {
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}) {
  return (
    <div className="space-y-1.5 text-sm">
      <div className="flex justify-between text-gray-600">
        <span>Subtotal</span>
        <span>{formatOrderPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-gray-600">
        <span>Envío</span>
        <span>{shippingCost === 0 ? <span className="text-emerald-600 font-medium">Gratis</span> : formatOrderPrice(shippingCost)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-emerald-600">
          <span>Descuento</span>
          <span>− {formatOrderPrice(discount)}</span>
        </div>
      )}
      <div className="flex justify-between font-bold text-gray-900 pt-1.5 border-t border-gray-200">
        <span>Total</span>
        <span>{formatOrderPrice(total)}</span>
      </div>
    </div>
  );
}

// ── Método de pago ────────────────────────────────────────────────────────────

const PAYMENT_LABELS: Record<string, string> = {
  bold:          "Bold",
  addi:          "Addi (crédito)",
  cash:          "Contraentrega",
  bank_transfer: "Transferencia bancaria",
};

// ── Modal principal ───────────────────────────────────────────────────────────

export function OrderDetailModal({ order, onClose, onDelivered }: OrderDetailModalProps) {
  const { confirming, confirmError, handleConfirmDelivery } = useOrderDelivery({
    orderId: order.id,
    onDelivered,
    onClose,
  });

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#154734]/10 rounded-lg shrink-0">
              <Package className="w-4 h-4 text-[#154734]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Detalle del pedido</h2>
              <p className="text-xs text-gray-500">{order.orderNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-5">

            {/* Estado + Fecha */}
            <div className="flex items-center justify-between">
              <OrderStatusBadge status={order.status} />
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatOrderDate(order.createdAt)}
              </span>
            </div>

            {/* Timeline */}
            <OrderTimeline order={order} />

            {/* Método de pago */}
            {order.paymentMethod && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-100">
                <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
                <span>
                  Pagado con{" "}
                  <span className="font-semibold text-gray-800">
                    {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                  </span>
                </span>
              </div>
            )}

            {/* Productos */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Productos
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/50">
                {order.items.map((item) => (
                  <div key={item.id} className="px-3">
                    <OrderItemRow item={item} />
                  </div>
                ))}
              </div>
            </div>

            {/* Dirección de envío */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Dirección de envío
              </h3>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl text-xs text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-800">{order.shippingAddress.fullName}</p>
                  <p className="mt-0.5">{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.department}</p>
                </div>
              </div>
            </div>

            {/* Código de seguimiento */}
            {order.trackingCode && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Seguimiento
                </h3>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-xs">
                  <Truck className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="font-mono tracking-wide text-gray-700">{order.trackingCode}</span>
                </div>
              </div>
            )}

            {/* Confirmar entrega */}
            {order.status === "SHIPPED" && (
              <div className="space-y-2">
                {confirmError && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs text-red-700">{confirmError}</p>
                  </div>
                )}
                <button
                  onClick={handleConfirmDelivery}
                  disabled={confirming}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#154734] text-white text-sm font-bold rounded-xl hover:bg-[#103a2a] active:scale-95 transition-all disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {confirming ? "Confirmando..." : "Confirmar que recibí mi pedido"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer — Desglose de precios */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 shrink-0">
          <PriceBreakdown
            subtotal={order.subtotal}
            shippingCost={order.shippingCost}
            discount={order.discount}
            total={order.total}
          />
        </div>
      </div>
    </div>
  );
}
