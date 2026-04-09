import type { OrderStatusInfo } from "../types";

// --- Formatea moneda COP ---
export const formatCOP = (amount: number | bigint | string): string => {
  const num = Number(amount);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// --- Mapea OrderStatus a etiquetas y estilos UI ---
export const mapOrderStatus = (status: string): OrderStatusInfo => {
  const statusMap: Record<string, OrderStatusInfo> = {
    PAID:       { label: "Pagado",     styleClass: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    PENDING:    { label: "Pendiente",  styleClass: "bg-amber-50 text-amber-700 border-amber-200" },
    PROCESSING: { label: "Procesando", styleClass: "bg-blue-50 text-blue-700 border-blue-200" },
    SHIPPED:    { label: "Enviado",    styleClass: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    DELIVERED:  { label: "Entregado",  styleClass: "bg-green-50 text-green-700 border-green-200" },
    CANCELLED:  { label: "Cancelado",  styleClass: "bg-red-50 text-red-700 border-red-200" },
    FAILED:     { label: "Fallido",    styleClass: "bg-red-50 text-red-700 border-red-200" },
  };
  return statusMap[status] ?? { label: status, styleClass: "bg-gray-100 text-gray-800" };
};

// --- Calcula tiempo relativo legible ---
export const timeAgo = (date: Date | string): string => {
  const secondsAgo = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (secondsAgo < 60) return "Hace unos segundos";
  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) return `Hace ${minutesAgo} min`;
  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `Hace ${hoursAgo} hora${hoursAgo > 1 ? "s" : ""}`;
  const daysAgo = Math.floor(hoursAgo / 24);
  return `Hace ${daysAgo} día${daysAgo > 1 ? "s" : ""}`;
};
