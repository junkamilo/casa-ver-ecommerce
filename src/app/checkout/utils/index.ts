import { LOCALE } from "../constants";

// --- Formatea moneda en formato colombiano ---
export function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(LOCALE)}`;
}
