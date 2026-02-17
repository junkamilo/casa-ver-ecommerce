"use client";

import Link from "next/link";
import {
  Package,
  ClipboardList,
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  ArrowUpRight,
  Plus,
  Clock,
  CreditCard
} from "lucide-react";

// --- DATA SIMULADA ---
const stats = [
  { label: "Ventas Hoy", value: "$1,250,000", change: "+12%", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
  { label: "Pedidos Hoy", value: "23", change: "+8%", icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
  { label: "Productos Activos", value: "48", change: "+2", icon: Package, color: "text-[#C19A6B]", bg: "bg-orange-50", border: "border-orange-100" }, // Dorado Marca
  { label: "Clientes Nuevos", value: "15", change: "+5%", icon: Users, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
];

const recentOrders = [
  { id: "ORD-001", customer: "María García", total: "$185,000", status: "Pagado", date: "Hace 5 min", method: "Nequi" },
  { id: "ORD-002", customer: "Carlos López", total: "$92,000", status: "Pendiente", date: "Hace 20 min", method: "PSE" },
  { id: "ORD-003", customer: "Ana Martínez", total: "$245,000", status: "Enviado", date: "Hace 1 hora", method: "T. Crédito" },
  { id: "ORD-004", customer: "Pedro Ruiz", total: "$78,000", status: "Pagado", date: "Hace 2 horas", method: "Efectivo" },
];

// Helper para estilos de estado (mismo que en AdminPedidos)
const getStatusStyles = (status: string) => {
    switch (status) {
        case "Pagado": return "bg-emerald-100 text-emerald-800 border-emerald-200";
        case "Pendiente": return "bg-amber-50 text-amber-700 border-amber-200";
        case "Enviado": return "bg-blue-50 text-blue-700 border-blue-200";
        case "Cancelado": return "bg-red-50 text-red-700 border-red-200";
        default: return "bg-gray-100 text-gray-800";
    }
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6 sm:space-y-8 p-3 sm:p-6 bg-gray-50 min-h-screen font-sans">

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#154734]" style={{ fontFamily: 'Georgia, serif' }}>Panel de Control</h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">Bienvenido de nuevo, aquí está lo que sucede hoy.</p>
        </div>
        <Link
          href="/admin/productos?action=new"
          className="inline-flex items-center justify-center gap-2 bg-[#154734] hover:bg-[#0f3626] text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95 font-medium text-sm sm:text-base"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </Link>
      </div>

      {/* --- KPI STATS --- */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className={`bg-white rounded-xl sm:rounded-2xl border ${stat.border} p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}
          >
            <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bg} rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 opacity-50`} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className={`p-2 sm:p-3 ${stat.bg} rounded-lg sm:rounded-xl ${stat.color}`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900">{stat.value}</h3>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5 sm:mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- ACCESOS RÁPIDOS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
        
        {/* Gestionar Productos */}
        <Link
          href="/admin/productos"
          className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#C19A6B] hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
             <ArrowUpRight className="w-5 h-5 text-[#C19A6B]" />
          </div>
          <div className="w-12 h-12 bg-[#154734]/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Package className="w-6 h-6 text-[#154734]" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-[#154734] transition-colors">Inventario</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Administra tu catálogo, actualiza precios y controla el stock.</p>
        </Link>

        {/* Ver Pedidos */}
        <Link
          href="/admin/pedidos"
          className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
             <ArrowUpRight className="w-5 h-5 text-blue-500" />
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <ClipboardList className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-700 transition-colors">Pedidos</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Revisa órdenes entrantes, estados de envío y detalles de clientes.</p>
        </Link>

        {/* Estadísticas */}
        <Link
          href="/admin/estadisticas"
          className="group bg-white rounded-2xl border border-gray-200 p-6 hover:border-purple-300 hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
             <ArrowUpRight className="w-5 h-5 text-purple-500" />
          </div>
          <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <BarChart3 className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-purple-700 transition-colors">Reportes</h3>
          <p className="text-sm text-gray-500 leading-relaxed">Analiza el rendimiento de ventas y métricas clave de tu negocio.</p>
        </Link>
      </div>

      {/* --- ÚLTIMOS PEDIDOS --- */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">Pedidos Recientes</h2>
            <p className="text-xs sm:text-sm text-gray-500">Últimas transacciones registradas</p>
          </div>
          <Link
            href="/admin/pedidos"
            className="text-xs sm:text-sm font-medium text-[#154734] hover:text-[#0f3626] flex items-center gap-1 hover:underline decoration-[#C19A6B]"
          >
            Ver todos <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">ID Pedido</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Método</th>
                <th className="px-6 py-4 text-right">Tiempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-[#154734] bg-[#154734]/5 px-2 py-1 rounded">
                        {order.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{order.customer}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-900">{order.total}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    {order.method}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-400">
                    <div className="flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {order.date}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="sm:hidden divide-y divide-gray-100">
          {recentOrders.map((order) => (
            <div key={order.id} className="p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#154734] bg-[#154734]/5 px-2 py-1 rounded">
                    {order.id}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {order.date}
                </span>
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="text-sm font-bold text-gray-900">{order.customer}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <CreditCard className="w-3 h-3" /> {order.method}
                    </p>
                </div>
                <p className="text-base font-bold text-gray-900">{order.total}</p>
              </div>
              
              <div className="flex justify-end">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles(order.status)}`}>
                    {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
