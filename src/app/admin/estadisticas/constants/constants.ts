import type { Period, SalesPeriodData, TopProduct, DailySale, CategorySale } from "../types/types";

// ── Etiquetas de período ──────────────────────────────────────────────────────

export const PERIOD_LABELS: Record<Period, string> = {
  day: "Hoy",
  week: "Esta Semana",
  month: "Este Mes",
};

// ── Datos de demostración (fallback / seeds) ──────────────────────────────────

export const SALES_DATA: Record<Period, SalesPeriodData> = {
  day:   { total: "$1,250,000",  orders: 23,  avgTicket: "$54,348", newCustomers: 15,  change: "+12%" },
  week:  { total: "$8,450,000",  orders: 142, avgTicket: "$59,507", newCustomers: 87,  change: "+8%"  },
  month: { total: "$32,800,000", orders: 567, avgTicket: "$57,848", newCustomers: 320, change: "+15%" },
};

export const TOP_PRODUCTS: TopProduct[] = [
  { name: "Enterizo Corto Tropical",  sold: 85, revenue: "$7,565,000",  trend: "+18%" },
  { name: "Set Short Deportivo",       sold: 72, revenue: "$9,000,000",  trend: "+12%" },
  { name: "Chaqueta Nylon Premium",    sold: 58, revenue: "$10,730,000", trend: "+25%" },
  { name: "Body Sport Premium",        sold: 45, revenue: "$2,925,000",  trend: "+5%"  },
  { name: "Set Pant Elegante",         sold: 42, revenue: "$6,090,000",  trend: "-3%"  },
  { name: "Bolso Gym Essential",       sold: 38, revenue: "$2,964,000",  trend: "+10%" },
];

export const DAILY_SALES: DailySale[] = [
  { day: "Lun", amount: 1_200_000 },
  { day: "Mar", amount:   980_000 },
  { day: "Mié", amount: 1_450_000 },
  { day: "Jue", amount: 1_100_000 },
  { day: "Vie", amount: 1_800_000 },
  { day: "Sáb", amount: 2_200_000 },
  { day: "Dom", amount: 1_720_000 },
];

export const MAX_DAILY_SALE = Math.max(...DAILY_SALES.map((d) => d.amount));

export const CATEGORY_SALES: CategorySale[] = [
  { name: "Enterizos",   percentage: 35, color: "bg-[#154734]" },
  { name: "Sets",        percentage: 28, color: "bg-[#C19A6B]" },
  { name: "Bodys",       percentage: 18, color: "bg-[#0f2e22]" },
  { name: "Chaquetas",   percentage: 12, color: "bg-[#e5d0b1]" },
  { name: "Accesorios",  percentage:  7, color: "bg-gray-400"  },
];

// ── Colores para gráfico de categorías ───────────────────────────────────────

export const CATEGORY_COLORS = [
  "bg-[#154734]",
  "bg-[#C19A6B]",
  "bg-[#0f2e22]",
  "bg-[#e5d0b1]",
  "bg-gray-400",
] as const;

// ── Utilidades ────────────────────────────────────────────────────────────────

/** Formatea un número como moneda COP colombiana */
export const formatPrice = (price: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(price);
