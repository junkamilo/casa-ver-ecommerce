/**
 * Constantes para gestión de estados de pedidos
 */

export const ALL_STATUSES = [
  "Todos", "Pendiente", "Procesando", "Pagado", "Enviado", "Entregado", "Cancelado", "Fallido", "Reembolsado",
];

/**
 * Estados que el sistema de pagos gestiona automáticamente.
 * El admin NO puede establecerlos manualmente.
 */
export const PAYMENT_MANAGED_STATUSES = new Set(["Pendiente", "Pagado", "Fallido"]);

/**
 * Estados terminales: una vez alcanzados no se pueden cambiar.
 */
export const TERMINAL_STATUSES = new Set(["Cancelado", "Reembolsado"]);

/**
 * Transiciones válidas que el admin puede ejecutar.
 * La llave es el estado ACTUAL del pedido.
 * El valor es la lista de estados a los que puede avanzar.
 *
 * Reglas de negocio:
 * - El flujo es hacia adelante: no se puede revertir un estado ya aplicado.
 * - CANCELADO y REEMBOLSADO son terminales (no permiten más cambios).
 * - PENDIENTE, PAGADO y FALLIDO los gestiona exclusivamente el sistema de pagos.
 */
export const VALID_ADMIN_TRANSITIONS: Record<string, string[]> = {
  Pagado:      ["Procesando", "Cancelado", "Reembolsado"],
  Procesando:  ["Enviado", "Cancelado", "Reembolsado"],
  Enviado:     ["Entregado", "Reembolsado"],
  Entregado:   ["Reembolsado"],
  Pendiente:   [],
  Fallido:     [],
  Cancelado:   [],
  Reembolsado: [],
};

export const ALL_METHODS = [
  "Todos", "Bold", "Addi", "Nequi", "Bancolombia", "Daviplata",
];

/**
 * Métodos de formateo y helpers para UI
 */

export function getValidTransitions(currentStatus: string): string[] {
  return VALID_ADMIN_TRANSITIONS[currentStatus] ?? [];
}

export const getStatusStyles = (status: string): string => {
  switch (status) {
    case "Pagado":     return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Pendiente":  return "bg-amber-50 text-amber-700 border-amber-200";
    case "Procesando": return "bg-blue-50 text-blue-700 border-blue-200";
    case "Enviado":    return "bg-sky-100 text-sky-800 border-sky-200";
    case "Entregado":    return "bg-gray-100 text-gray-800 border-gray-200";
    case "Cancelado":    return "bg-red-50 text-red-700 border-red-200";
    case "Fallido":      return "bg-red-100 text-red-800 border-red-300";
    case "Reembolsado":  return "bg-purple-50 text-purple-700 border-purple-200";
    default:             return "bg-gray-100 text-gray-800";
  }
};

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
