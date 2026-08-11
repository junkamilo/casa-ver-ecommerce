"use client";

/**
 * PriceInput — Campo de precio con formato colombiano (60.000)
 *
 * - Almacena el número puro como string ("60000") en el estado del padre.
 * - Muestra el valor formateado con puntos de miles mientras el usuario escribe.
 * - Usa type="text" + inputMode="numeric" para evitar el redondeo del browser
 *   que ocurría con type="number" (ej: 60000 → 59999).
 */

interface PriceInputProps {
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
}

/** "60000" → "60.000" | "" → "" */
function formatThousands(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return parseInt(digits, 10).toLocaleString("es-CO");
}

/** "60.000" → "60000" */
function stripFormat(formatted: string): string {
  return formatted.replace(/\./g, "").replace(/,/g, "").replace(/\D/g, "");
}

export default function PriceInput({
  value,
  onChange,
  placeholder = "0",
  disabled = false,
  hasError = false,
  className = "",
}: PriceInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = stripFormat(e.target.value);
    // Evitar leading zeros (ej: "007" → "7")
    const normalized = raw ? String(parseInt(raw, 10)) : "";
    onChange(normalized);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={formatThousands(value)}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      aria-invalid={hasError || undefined}
      className={className}
      autoComplete="off"
    />
  );
}
