import type { Order } from "./types";

export const ORDERS: Order[] = [
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

export const ALL_STATUSES = ["Todos", "Pagado", "Pendiente", "Enviado", "Entregado", "Cancelado"];

export const ALL_METHODS = ["Todos", "Nequi", "PSE", "Tarjeta Crédito", "Efectivo", "Daviplata"];

export const getStatusStyles = (status: string): string => {
  switch (status) {
    case "Pagado":    return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Pendiente": return "bg-amber-50 text-amber-700 border-amber-200";
    case "Enviado":   return "bg-blue-50 text-blue-700 border-blue-200";
    case "Entregado": return "bg-gray-100 text-gray-800 border-gray-200";
    case "Cancelado": return "bg-red-50 text-red-700 border-red-200";
    default:          return "bg-gray-100 text-gray-800";
  }
};

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
