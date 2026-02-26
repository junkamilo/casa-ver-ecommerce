import { X, User, Package, MapPin, CreditCard, Calendar } from "lucide-react";
import { getStatusStyles, formatPrice } from "../constants";
import type { Order } from "../types";

interface PedidoDetailModalProps {
  order: Order;
  onClose: () => void;
}

export function PedidoDetailModal({ order, onClose }: PedidoDetailModalProps) {
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
          <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total a Pagar</p>
              <p className="text-2xl font-bold text-[#154734]">{formatPrice(order.total)}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(order.status)}`}>
              {order.status}
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
          <button className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
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
