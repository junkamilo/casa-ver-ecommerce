// ── Formatters ────────────────────────────────────────────────────────────────

export const formatPrice = (val: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(val);

// ── Style Helpers ─────────────────────────────────────────────────────────────

/** Input del formulario (acento dorado) */
export const inputCls = (hasError = false) =>
  `w-full px-4 py-2.5 rounded-lg border ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
      : "border-gray-200 focus:border-[#C19A6B] focus:ring-[#C19A6B]/10"
  } focus:ring-4 outline-none text-sm transition-colors`;
