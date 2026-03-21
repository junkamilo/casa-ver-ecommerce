"use client";

import { SelectedColor } from "../../types";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

const MIN_STOCK = 2; // Umbral de alerta — cuando stock <= minStock

interface Props {
  selectedColors: SelectedColor[];
  selectedSizes: string[];
  disabled: boolean;
  productId?: string; // Para actualizar en tiempo real si existe (edición)
  onUpdate: (colorName: string, size: string, stock: number) => void;
}

export default function VariantStockSection({
  selectedColors,
  selectedSizes,
  disabled,
  productId,
  onUpdate,
}: Props) {
  const [updating, setUpdating] = useState<string | null>(null);

  if (!selectedColors.length || !selectedSizes.length) {
    return (
      <p className="text-xs text-gray-400 italic">
        Selecciona al menos un color y una talla para editar el stock por variante.
      </p>
    );
  }

  const totalStock = selectedColors.reduce(
    (sum, c) =>
      sum +
      selectedSizes.reduce(
        (s, size) => s + Number(c.variantStocks?.[size] ?? 0),
        0
      ),
    0
  );

  // Detectar variantes con stock bajo
  const lowStockVariants = selectedColors.flatMap((color) =>
    selectedSizes
      .filter((size) => {
        const stock = Number(color.variantStocks?.[size] ?? 0);
        return stock <= MIN_STOCK;
      })
      .map((size) => `${color.name} - ${size}`)
  );

  // Manejar cambio de stock (local + opcional servidor en edición)
  const handleStockChange = async (
    color: SelectedColor,
    size: string,
    newStock: number
  ) => {
    // Actualizar estado local inmediatamente (optimistic update)
    onUpdate(color.name, size, newStock);

    // Si es edición y tenemos productId y colorId, sincronizar con servidor
    // Esto requeriría pasar el color.id completo desde el backend
  };

  return (
    <div className="space-y-3">
      {/* Alerta de stock bajo */}
      {lowStockVariants.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700">
            <p className="font-semibold">
              ⚠️ Stock bajo en {lowStockVariants.length} variante(s):
            </p>
            <p className="mt-1">{lowStockVariants.join(", ")}</p>
          </div>
        </div>
      )}

      {/* Tabla de stock por variante */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide min-w-[120px]">
                Color
              </th>
              {selectedSizes.map((size) => (
                <th
                  key={size}
                  className="text-center px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide min-w-[90px]"
                >
                  {size}
                  <div className="text-[10px] font-normal text-gray-400 mt-0.5">
                    (mín. {MIN_STOCK})
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedColors.map((color, rowIdx) => (
              <tr
                key={color.name}
                className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: color.hexCode }}
                    />
                    <span className="text-xs font-semibold text-gray-700 truncate">
                      {color.name}
                    </span>
                  </div>
                </td>
                {selectedSizes.map((size) => {
                  const rawStock = color.variantStocks?.[size];
                  const stock = Number(rawStock ?? 0);
                  const isLowStock = stock <= MIN_STOCK;
                  const cellKey = `${color.name}-${size}`;
                  const isUpdating = updating === cellKey;

                  return (
                    <td key={size} className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1 relative">
                        <input
                          type="number"
                          min="0"
                          disabled={disabled || isUpdating}
                          value={rawStock !== undefined ? stock : ""}
                          onChange={(e) =>
                            handleStockChange(color, size, e.target.value === "" ? NaN : Number(e.target.value))
                          }
                          className={`w-14 text-center px-2 py-1.5 rounded-lg border text-sm outline-none transition-colors ${
                            isLowStock
                              ? "border-amber-300 bg-amber-50 focus:border-amber-500 focus:ring-amber-100"
                              : "border-gray-200 focus:border-[#C19A6B] focus:ring-[#C19A6B]/10"
                          } disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2`}
                        />
                        {isUpdating && (
                          <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin absolute right-1" />
                        )}
                        {!isUpdating && isLowStock && (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen de stock total */}
      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <span className="text-xs font-semibold text-blue-700">📦 Stock total:</span>
        <span className="text-sm font-bold text-blue-900">{totalStock} unidades</span>
      </div>
    </div>
  );
}
