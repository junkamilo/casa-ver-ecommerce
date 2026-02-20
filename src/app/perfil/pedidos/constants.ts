import { OrderStatus, OrderFilter } from "./types";

export interface StatusConfig {
  label: string;
  color: string;
  dotColor: string;
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  PENDING: {
    label: "Pendiente",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    dotColor: "bg-yellow-500",
  },
  CONFIRMED: {
    label: "Confirmado",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dotColor: "bg-blue-500",
  },
  PROCESSING: {
    label: "En proceso",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    dotColor: "bg-purple-500",
  },
  SHIPPED: {
    label: "Enviado",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    dotColor: "bg-orange-500",
  },
  DELIVERED: {
    label: "Entregado",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  CANCELLED: {
    label: "Cancelado",
    color: "bg-red-50 text-red-700 border-red-200",
    dotColor: "bg-red-400",
  },
};

export const ORDER_FILTER_LABELS: Record<OrderFilter, string> = {
  ALL: "Todos",
  PENDING: "Pendientes",
  CONFIRMED: "Confirmados",
  PROCESSING: "En proceso",
  SHIPPED: "Enviados",
  DELIVERED: "Entregados",
  CANCELLED: "Cancelados",
};

export const VISIBLE_FILTERS: OrderFilter[] = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const formatOrderPrice = (value: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);

export const formatOrderDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
