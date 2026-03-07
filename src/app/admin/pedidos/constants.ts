export const ALL_STATUSES = [
  "Todos", "Pendiente", "Procesando", "Pagado", "Enviado", "Entregado", "Cancelado", "Fallido",
];

export const ALL_METHODS = [
  "Todos", "Bold", "Addi", "Nequi", "Bancolombia", "Daviplata",
];

export const getStatusStyles = (status: string): string => {
  switch (status) {
    case "Pagado":     return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "Pendiente":  return "bg-amber-50 text-amber-700 border-amber-200";
    case "Procesando": return "bg-blue-50 text-blue-700 border-blue-200";
    case "Enviado":    return "bg-sky-100 text-sky-800 border-sky-200";
    case "Entregado":  return "bg-gray-100 text-gray-800 border-gray-200";
    case "Cancelado":  return "bg-red-50 text-red-700 border-red-200";
    case "Fallido":    return "bg-red-100 text-red-800 border-red-300";
    default:           return "bg-gray-100 text-gray-800";
  }
};

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
