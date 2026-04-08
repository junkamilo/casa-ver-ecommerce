"use client";

import { useState } from "react";
import { SelectedColor } from "../../types";
import { AlertTriangle, Zap } from "lucide-react";

const MIN_STOCK = 2;   // Umbral de alerta
const MAX_STOCK = 9999; // Límite máximo por variante

interface Props {
  selectedColors: SelectedColor[];
  selectedSizes: string[];
  disabled: boolean;
  onUpdate: (colorName: string, size: string, stock: number) => void;
}

export default function VariantStockSection({
  selectedColors,
  selectedSizes,
  disabled,
  onUpdate,
}: Props) {
  const [bulkStock, setBulkStock] = useState("");

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

  const handleStockChange = (color: SelectedColor, size: string, newStock: number) => {
    onUpdate(color.name, size, newStock);
  };

  const handleBulkFill = () => {
    const value = parseInt(bulkStock, 10);
    if (isNaN(value) || value < 0 || value > MAX_STOCK) return;
    for (const color of selectedColors) {
      for (const size of selectedSizes) {
        onUpdate(color.name, size, value);
      }
    }
    setBulkStock("");
  };

  return (
    <div className="space-y-3">
      {/* Relleno rápido */}
      <div className="flex items-center gap-2 p-3 bg-[#154734]/5 border border-[#154734]/20 rounded-lg">
        <Zap className="w-4 h-4 text-[#154734] shrink-0" />
        <span className="text-xs font-semibold text-[#154734] shrink-0">
          Stock por talla:
        </span>
        <input
          type="number"
          min="0"
          max={MAX_STOCK}
          value={bulkStock}
          onChange={(e) => setBulkStock(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleBulkFill())}
          placeholder="ej. 10"
          disabled={disabled}
          className="w-20 text-center px-2 py-1.5 rounded-lg border border-[#154734]/30 focus:border-[#154734] focus:ring-2 focus:ring-[#154734]/10 outline-none text-sm disabled:opacity-50"
        />
        <button
          type="button"
          disabled={disabled || !bulkStock}
          onClick={handleBulkFill}
          className="px-3 py-1.5 text-xs font-bold text-white bg-[#154734] hover:bg-[#103a2a] rounded-lg transition-colors disabled:opacity-40"
        >
          Aplicar a todas
        </button>
        <span className="text-[10px] text-gray-400">
          Se asigna este stock a cada talla seleccionada
        </span>
      </div>

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
              <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide min-w-30">
                Color
              </th>
              {selectedSizes.map((size) => (
                <th
                  key={size}
                  className="text-center px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide min-w-22.5"
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

                  return (
                    <td key={size} className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1 relative">
                        <input
                          type="number"
                          min="0"
                          max={MAX_STOCK}
                          disabled={disabled}
                          value={rawStock !== undefined ? stock : ""}
                          onChange={(e) => {
                            const val = e.target.value === "" ? NaN : Math.min(Number(e.target.value), MAX_STOCK);
                            handleStockChange(color, size, val);
                          }}
                          className={`w-14 text-center px-2 py-1.5 rounded-lg border text-sm outline-none transition-colors ${
                            isLowStock
                              ? "border-amber-300 bg-amber-50 focus:border-amber-500 focus:ring-amber-100"
                              : "border-gray-200 focus:border-[#C19A6B] focus:ring-[#C19A6B]/10"
                          } disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2`}
                        />
                        {isLowStock && (
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
