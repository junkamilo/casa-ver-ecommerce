"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  Calendar,
  Package,
  X,
} from "lucide-react";

const orders = [
  {
    id: "ORD-2024-001",
    customer: "María García",
    email: "maria@email.com",
    phone: "+57 312 456 7890",
    items: [
      { name: "Enterizo Corto Tropical", qty: 1, price: 89000 },
      { name: "Balaca Deportiva", qty: 2, price: 25000 },
    ],
    total: 139000,
    status: "Pagado",
    paymentMethod: "Nequi",
    date: "2024-12-15 14:32",
    address: "Cra 15 #82-30, Bogotá",
  },
  {
    id: "ORD-2024-002",
    customer: "Carlos López",
    email: "carlos@email.com",
    phone: "+57 300 123 4567",
    items: [{ name: "Set Short Deportivo", qty: 1, price: 125000 }],
    total: 125000,
    status: "Pendiente",
    paymentMethod: "PSE",
    date: "2024-12-15 13:15",
    address: "Cl 45 #12-56, Medellín",
  },
  {
    id: "ORD-2024-003",
    customer: "Ana Martínez",
    email: "ana@email.com",
    phone: "+57 315 789 0123",
    items: [
      { name: "Chaqueta Nylon Premium", qty: 1, price: 185000 },
      { name: "Bolso Gym Essential", qty: 1, price: 78000 },
    ],
    total: 263000,
    status: "Enviado",
    paymentMethod: "Tarjeta Crédito",
    date: "2024-12-15 10:48",
    address: "Av 6N #25-120, Cali",
  },
  {
    id: "ORD-2024-004",
    customer: "Pedro Ruiz",
    email: "pedro@email.com",
    phone: "+57 318 654 3210",
    items: [{ name: "Body Sport Premium", qty: 2, price: 65000 }],
    total: 130000,
    status: "Entregado",
    paymentMethod: "Efectivo",
    date: "2024-12-14 18:20",
    address: "Cra 7 #30-15, Bucaramanga",
  },
  {
    id: "ORD-2024-005",
    customer: "Laura Díaz",
    email: "laura@email.com",
    phone: "+57 301 987 6543",
    items: [{ name: "Set Pant Elegante", qty: 1, price: 145000 }],
    total: 145000,
    status: "Cancelado",
    paymentMethod: "Daviplata",
    date: "2024-12-14 09:05",
    address: "Cl 72 #8-22, Barranquilla",
  },
];

const statusColors: Record<string, string> = {
  Pagado: "bg-green-100 text-green-700",
  Pendiente: "bg-yellow-100 text-yellow-700",
  Enviado: "bg-blue-100 text-blue-700",
  Entregado: "bg-emerald-100 text-emerald-700",
  Cancelado: "bg-red-100 text-red-700",
};

const allStatuses = ["Todos", "Pagado", "Pendiente", "Enviado", "Entregado", "Cancelado"];
const allMethods = ["Todos", "Nequi", "PSE", "Tarjeta Crédito", "Efectivo", "Daviplata"];

export default function AdminPedidos() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [methodFilter, setMethodFilter] = useState("Todos");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<typeof orders[0] | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "Todos" || o.status === statusFilter;
    const matchMethod = methodFilter === "Todos" || o.paymentMethod === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} pedidos en total</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          <Download className="w-4 h-4" />
          Exportar Reporte
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o # pedido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 focus:border-[#154734]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 bg-white"
          >
            {allStatuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 bg-white"
          >
            {allMethods.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
              <th className="px-5 py-3">Pedido</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Método</th>
              <th className="px-5 py-3">Fecha</th>
              <th className="px-5 py-3 text-right">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-gray-900">{order.id}</td>
                <td className="px-5 py-3">
                  <div>
                    <p className="text-sm text-gray-900">{order.customer}</p>
                    <p className="text-xs text-gray-400">{order.email}</p>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm font-semibold text-gray-900">{formatPrice(order.total)}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-gray-500">{order.paymentMethod}</td>
                <td className="px-5 py-3 text-sm text-gray-400">{order.date}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => setDetailOrder(order)}
                    className="p-2 text-gray-400 hover:text-[#154734] hover:bg-[#154734]/5 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((order) => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              className="w-full p-4 text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{order.id}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{order.customer}</p>
                  <p className="text-xs text-gray-400">{order.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
                  {expandedOrder === order.id ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </button>
            {expandedOrder === order.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                <div className="flex items-start gap-2 text-sm">
                  <CreditCard className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-gray-600">{order.paymentMethod}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-gray-600">{order.address}</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Package className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    {order.items.map((item, i) => (
                      <p key={i} className="text-gray-600">
                        {item.qty}x {item.name} — {formatPrice(item.price)}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Detalle del Pedido</h2>
              <button onClick={() => setDetailOrder(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">{detailOrder.id}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[detailOrder.status]}`}>
                  {detailOrder.status}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{detailOrder.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{detailOrder.paymentMethod}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">{detailOrder.address}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Cliente</h3>
                <p className="text-sm text-gray-700">{detailOrder.customer}</p>
                <p className="text-xs text-gray-500">{detailOrder.email}</p>
                <p className="text-xs text-gray-500">{detailOrder.phone}</p>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Productos</h3>
                {detailOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm text-gray-700">{item.name}</p>
                      <p className="text-xs text-gray-400">Cantidad: {item.qty}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                  <span className="text-sm font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-[#154734]">{formatPrice(detailOrder.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
