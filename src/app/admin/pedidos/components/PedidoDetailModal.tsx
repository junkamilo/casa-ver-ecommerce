"use client";

import { useState } from "react";
import { X, User, Package, MapPin, CreditCard, Calendar, ChevronDown, CheckCircle2, Lock, AlertCircle } from "lucide-react";
import { getStatusStyles, formatPrice, getValidTransitions, PAYMENT_MANAGED_STATUSES, TERMINAL_STATUSES } from "../constants";
import { updateOrderStatus } from "@/app/actions/orders";
import { printOrder } from "@/lib/print/printOrder";
import type { Order } from "../types";

interface PedidoDetailModalProps {
  order: Order;
  onClose: () => void;
  onStatusUpdated: (orderNumber: string, newStatus: string) => void;
}

export function PedidoDetailModal({ order, onClose, onStatusUpdated }: PedidoDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validTransitions = getValidTransitions(order.status);
  const isPaymentManaged = PAYMENT_MANAGED_STATUSES.has(order.status);
  const isTerminal = TERMINAL_STATUSES.has(order.status);
  const canChange = validTransitions.length > 0;

  function handlePrint() {
    printOrder({
      orderNumber:  order.id,
      date:         order.date,
      status:       order.status,
      customer:     { name: order.customer, email: order.email, phone: order.phone },
      shipping:     { address: order.address },
      payment:      { method: order.paymentMethod },
      items:        order.items.map((i) => ({ name: i.name, qty: i.qty, unitPrice: i.price })),
      subtotal:     order.subtotal     ?? order.total,
      shippingCost: order.shippingCost ?? 0,
      discount:     order.discount     ?? 0,
      total:        order.total,
    });
  }

  async function handleSave() {
    if (!selectedStatus) return;
    setError(null);
    setSaving(true);
    try {
      await updateOrderStatus(order.id, selectedStatus);
      onStatusUpdated(order.id, selectedStatus);
      setSelectedStatus("");
    } catch (e: any) {
      setError(e?.message ?? "Error al cambiar el estado");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2
              className="text-lg font-bold text-[#154734]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Detalle del Pedido
            </h2>
            <p className="text-xs text-gray-500">ID: {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 bg-gray-50/30">

          {/* Estado y Total */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total a Pagar</p>
                <p className="text-2xl font-bold text-[#154734]">{formatPrice(order.total)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* Cambio de estado */}
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cambiar Estado</p>

              {isPaymentManaged && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-xs text-amber-700">
                  <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    Este estado (<strong>{order.status}</strong>) lo gestiona automáticamente el sistema de pagos. No puede modificarse manualmente.
                  </span>
                </div>
              )}

              {isTerminal && (
                <div className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-600">
                  <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <span>
                    El pedido está en estado <strong>{order.status}</strong>. Este es un estado final y no puede modificarse.
                  </span>
                </div>
              )}

              {canChange && (
                <>
                  <div className="relative">
                    <select
                      value={selectedStatus}
                      onChange={(e) => { setSelectedStatus(e.target.value); setError(null); }}
                      className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#154734]/30 focus:border-[#154734] cursor-pointer"
                    >
                      <option value="">— Seleccionar nuevo estado —</option>
                      {validTransitions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>

                  {error && (
                    <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700">
                      <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {selectedStatus && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="mt-2 w-full py-2 bg-[#154734] text-white text-sm font-bold rounded-lg hover:bg-[#103a2a] transition-colors disabled:opacity-60"
                    >
                      {saving ? "Guardando..." : `Cambiar a "${selectedStatus}"`}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Datos del Cliente */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2 mb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#C19A6B]" />
              Datos del Cliente
            </h3>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Nombre</span>
                <span className="font-medium text-gray-900">{order.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">{order.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Teléfono</span>
                <span className="font-medium text-gray-900">{order.phone}</span>
              </div>
            </div>
          </div>

          {/* Envío y Pago */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2 mb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#C19A6B]" />
              Envío y Pago
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Dirección de Entrega</p>
                  <p className="text-gray-500 text-xs">{order.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Método de Pago</p>
                  <p className="text-gray-500 text-xs">{order.paymentMethod}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Fecha de Orden</p>
                  <p className="text-gray-500 text-xs">{order.date}</p>
                </div>
              </div>
              {order.deliveredAt && (
                <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-emerald-700">Confirmado por el cliente</p>
                    <p className="text-gray-500 text-xs">{order.deliveredAt}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumen de Compra */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2 mb-2">
              Resumen de Compra
            </h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-gray-100 text-xs font-bold flex items-center justify-center text-gray-600">
                      {item.qty}
                    </span>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-lg text-[#154734]">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Descargar PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#154734] text-white font-bold rounded-lg hover:bg-[#103a2a] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
