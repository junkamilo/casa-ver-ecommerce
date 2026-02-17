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
  User,
  Phone,
  Mail,
  Receipt
} from "lucide-react";

// --- DATA SIMULADA ---
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

// Función para colores de estado más sofisticados
const getStatusStyles = (status: string) => {
    switch (status) {
        case "Pagado": return "bg-emerald-100 text-emerald-800 border-emerald-200";
        case "Pendiente": return "bg-amber-50 text-amber-700 border-amber-200";
        case "Enviado": return "bg-blue-50 text-blue-700 border-blue-200";
        case "Entregado": return "bg-gray-100 text-gray-800 border-gray-200";
        case "Cancelado": return "bg-red-50 text-red-700 border-red-200";
        default: return "bg-gray-100 text-gray-800";
    }
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
    <div className="space-y-6 sm:space-y-8 p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#154734]" style={{ fontFamily: 'Georgia, serif' }}>Pedidos</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-xs sm:text-sm">
            <Receipt className="w-4 h-4" />
            Gestión y seguimiento de ventas
          </p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg hover:bg-gray-50 hover:border-[#C19A6B] transition-all text-sm font-medium shadow-sm self-start sm:self-auto">
          <Download className="w-4 h-4 text-[#C19A6B]" />
          Exportar Reporte
        </button>
      </div>

      {/* --- FILTROS Y BÚSQUEDA --- */}
      <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">

        {/* Buscador */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por cliente o ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 bg-gray-50 border-transparent focus:bg-white border focus:border-[#C19A6B] rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-[#C19A6B]/10 transition-all"
          />
        </div>

        {/* Filtros Dropdown */}
        <div className="grid grid-cols-2 sm:flex gap-3 w-full md:w-auto">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-40 pl-9 sm:pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 bg-white appearance-none cursor-pointer hover:border-[#154734]"
            >
                {allStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="relative">
             <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
             <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full sm:w-40 pl-9 sm:pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#154734]/20 bg-white appearance-none cursor-pointer hover:border-[#154734]"
            >
                {allMethods.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* --- TABLA (DESKTOP) --- */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Pedido</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Método</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50/60 transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-[#154734] bg-[#154734]/5 px-2 py-1 rounded">
                    {order.id}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                    <span className="text-xs text-gray-500">{order.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-gray-900">{formatPrice(order.total)}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{order.paymentMethod}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                   {order.date.split(" ")[0]}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setDetailOrder(order)}
                    className="p-2 text-gray-400 hover:text-[#C19A6B] hover:bg-orange-50 rounded-lg transition-colors"
                    title="Ver Detalle"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-500">
                <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No se encontraron pedidos</p>
            </div>
        )}
      </div>

      {/* --- MOBILE CARDS --- */}
      <div className="md:hidden space-y-3">
        {filtered.map((order) => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <button
              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              className="w-full p-3 sm:p-4 text-left hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#154734] bg-[#154734]/5 px-2 py-1 rounded">
                    {order.id}
                </span>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${getStatusStyles(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                   <h3 className="text-sm font-bold text-gray-900">{order.customer}</h3>
                   <p className="text-xs text-gray-500 mt-0.5">{order.date}</p>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-base font-bold text-[#154734]">{formatPrice(order.total)}</span>
                   {expandedOrder === order.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
              </div>
            </button>
            
            {/* Detalle Expandible Móvil */}
            {expandedOrder === order.id && (
              <div className="px-4 pb-4 pt-2 bg-gray-50/50 border-t border-gray-100 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-600 bg-white p-2 rounded border border-gray-100">
                        <CreditCard className="w-3.5 h-3.5 text-[#C19A6B]" />
                        {order.paymentMethod}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 bg-white p-2 rounded border border-gray-100">
                        <MapPin className="w-3.5 h-3.5 text-[#C19A6B]" />
                        <span className="truncate">{order.address}</span>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</p>
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                         <span className="text-gray-700">{item.qty}x {item.name}</span>
                         <span className="font-medium text-gray-900">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                </div>
                
                <button 
                    onClick={() => setDetailOrder(order)}
                    className="w-full mt-2 py-2 text-center text-xs font-bold text-[#154734] hover:bg-[#154734]/5 rounded transition-colors"
                >
                    Ver Factura Completa
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- MODAL DE DETALLE (FACTURA) --- */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold text-[#154734]" style={{ fontFamily: 'Georgia, serif' }}>Detalle del Pedido</h2>
                <p className="text-xs text-gray-500">ID: {detailOrder.id}</p>
              </div>
              <button 
                onClick={() => setDetailOrder(null)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 bg-gray-50/30">
              
              {/* Estado y Total */}
              <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                 <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total a Pagar</p>
                    <p className="text-2xl font-bold text-[#154734]">{formatPrice(detailOrder.total)}</p>
                 </div>
                 <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(detailOrder.status)}`}>
                    {detailOrder.status}
                 </div>
              </div>

              {/* Información Cliente */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
                 <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#C19A6B]" />
                    Datos del Cliente
                 </h3>
                 <div className="grid gap-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Nombre</span>
                        <span className="font-medium text-gray-900">{detailOrder.customer}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Email</span>
                        <span className="font-medium text-gray-900">{detailOrder.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Teléfono</span>
                        <span className="font-medium text-gray-900">{detailOrder.phone}</span>
                    </div>
                 </div>
              </div>

              {/* Información Envío y Pago */}
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
                            <p className="text-gray-500 text-xs">{detailOrder.address}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-900">Método de Pago</p>
                            <p className="text-gray-500 text-xs">{detailOrder.paymentMethod}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-gray-900">Fecha de Orden</p>
                            <p className="text-gray-500 text-xs">{detailOrder.date}</p>
                        </div>
                    </div>
                 </div>
              </div>

              {/* Lista de Productos */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="text-sm font-bold text-gray-900 border-b border-gray-50 pb-2 mb-2">Resumen de Compra</h3>
                 <div className="space-y-3">
                    {detailOrder.items.map((item, i) => (
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
                    <span className="font-bold text-lg text-[#154734]">{formatPrice(detailOrder.total)}</span>
                 </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                    Descargar PDF
                </button>
                <button 
                    onClick={() => setDetailOrder(null)}
                    className="flex-1 py-2.5 bg-[#154734] text-white font-bold rounded-lg hover:bg-[#103a2a] transition-colors"
                >
                    Cerrar
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
