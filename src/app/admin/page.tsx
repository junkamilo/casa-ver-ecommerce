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
  Eye,
  Plus,
} from "lucide-react";

// Data genérica de ejemplo
const stats = [
  { label: "Ventas Hoy", value: "$1,250,000", change: "+12%", icon: DollarSign, color: "bg-emerald-500" },
  { label: "Pedidos Hoy", value: "23", change: "+8%", icon: ShoppingCart, color: "bg-blue-500" },
  { label: "Productos Activos", value: "48", change: "+2", icon: Package, color: "bg-purple-500" },
  { label: "Clientes Nuevos", value: "15", change: "+5%", icon: Users, color: "bg-amber-500" },
];

const recentOrders = [
  { id: "ORD-001", customer: "María García", total: "$185,000", status: "Pagado", date: "Hace 5 min", method: "Nequi" },
  { id: "ORD-002", customer: "Carlos López", total: "$92,000", status: "Pendiente", date: "Hace 20 min", method: "PSE" },
  { id: "ORD-003", customer: "Ana Martínez", total: "$245,000", status: "Enviado", date: "Hace 1 hora", method: "T. Crédito" },
  { id: "ORD-004", customer: "Pedro Ruiz", total: "$78,000", status: "Pagado", date: "Hace 2 horas", method: "Efectivo" },
];

const statusColors: Record<string, string> = {
  Pagado: "bg-green-100 text-green-700",
  Pendiente: "bg-yellow-100 text-yellow-700",
  Enviado: "bg-blue-100 text-blue-700",
  Cancelado: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen general de tu tienda</p>
        </div>
        <Link
          href="/admin/productos?action=new"
          className="inline-flex items-center gap-2 bg-[#154734] text-white px-4 py-2.5 rounded-lg hover:bg-[#1a5c43] transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/productos"
          className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#154734]/30 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-[#154734]/10 w-12 h-12 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-[#154734]" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-[#154734] transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Gestionar Productos</h3>
          <p className="text-sm text-gray-500">Agregar, editar precios, stock y activar/desactivar productos</p>
        </Link>

        <Link
          href="/admin/pedidos"
          className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#154734]/30 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Ver Pedidos</h3>
          <p className="text-sm text-gray-500">Pedidos en tiempo real, filtros y exportación de reportes</p>
        </Link>

        <Link
          href="/admin/estadisticas"
          className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-[#154734]/30 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-purple-600 transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Estadísticas</h3>
          <p className="text-sm text-gray-500">Ventas por día, semana, mes y productos más vendidos</p>
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Últimos Pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm text-[#154734] hover:underline flex items-center gap-1">
            <Eye className="w-4 h-4" />
            Ver todos
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3">Pedido</th>
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3">Método</th>
                <th className="px-5 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{order.id}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{order.customer}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">{order.total}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{order.method}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {recentOrders.map((order) => (
            <div key={order.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{order.id}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{order.customer}</span>
                <span className="font-semibold text-gray-900">{order.total}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{order.method}</span>
                <span>{order.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
