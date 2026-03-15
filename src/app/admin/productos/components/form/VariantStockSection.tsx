import { SelectedColor } from "../../types";

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

  return (
    <div className="space-y-3">
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
                  className="text-center px-3 py-2.5 text-xs font-bold text-gray-500 uppercase tracking-wide min-w-[70px]"
                >
                  {size}
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
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: color.hexCode }}
                    />
                    <span className="text-xs font-semibold text-gray-700 truncate">
                      {color.name}
                    </span>
                  </div>
                </td>
                {selectedSizes.map((size) => (
                  <td key={size} className="px-3 py-2 text-center">
                    <input
                      type="number"
                      min="0"
                      disabled={disabled}
                      value={color.variantStocks?.[size] ?? 0}
                      onChange={(e) =>
                        onUpdate(color.name, size, Number(e.target.value))
                      }
                      className="w-16 text-center px-2 py-1.5 rounded-lg border border-gray-200 focus:border-[#C19A6B] focus:ring-2 focus:ring-[#C19A6B]/10 outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-400 text-right">
        Stock total calculado:{" "}
        <span className="font-bold text-gray-600">{totalStock}</span> unidades
      </p>
    </div>
  );
}
