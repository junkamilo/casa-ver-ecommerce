"use client";

import { Pencil, Trash2, Palette, Loader2 } from "lucide-react";
import type { ColorListProps, Color } from "../types/types";

const Toggle = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
  <button
    type="button"
    onClick={onToggle}
    title={active ? "Desactivar" : "Activar"}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
      active ? "bg-[#154734]" : "bg-gray-200"
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        active ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

const ColorRow = ({
  color,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  color: Color;
  onEdit: (c: Color) => void;
  onToggleActive: (c: Color) => void;
  onDelete: (c: Color) => void;
}) => (
  <tr className="hover:bg-gray-50/60 transition-colors group">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-lg border border-black/10 shrink-0 shadow-sm"
          style={{ backgroundColor: color.hexCode }}
        />
        <div>
          <p className="text-sm font-semibold text-gray-900">{color.name}</p>
          <p className="text-[11px] font-mono text-gray-400">{color.hexCode}</p>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <Toggle active={color.isActive} onToggle={() => onToggleActive(color)} />
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onEdit(color)}
          title="Editar"
          className="p-2 text-gray-400 hover:text-[#C19A6B] bg-gray-50 rounded-lg transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(color)}
          title="Eliminar"
          className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </td>
  </tr>
);

const ColorMobileCard = ({
  color,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  color: Color;
  onEdit: (c: Color) => void;
  onToggleActive: (c: Color) => void;
  onDelete: (c: Color) => void;
}) => (
  <div className="p-4 border-b border-gray-100 last:border-b-0">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 rounded-xl border border-black/10 shrink-0 shadow-sm"
          style={{ backgroundColor: color.hexCode }}
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{color.name}</p>
          <p className="text-[11px] font-mono text-gray-400">{color.hexCode}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Toggle active={color.isActive} onToggle={() => onToggleActive(color)} />
        <button
          type="button"
          onClick={() => onEdit(color)}
          className="p-2 text-gray-400 hover:text-[#C19A6B] bg-gray-50 rounded-lg"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(color)}
          className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
);

const ColorList = ({ loading, colors, onEdit, onToggleActive, onDelete }: ColorListProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 py-20 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
      </div>
    );
  }

  if (colors.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 text-center py-16">
        <div className="w-14 h-14 bg-[#154734]/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Palette className="w-7 h-7 text-[#154734]/40" />
        </div>
        <p className="text-gray-500 font-medium mb-1">Sin colores</p>
        <p className="text-sm text-gray-400">
          Crea el primer color para usarlo en los productos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop */}
      <table className="w-full hidden md:table">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            {["Color", "Estado", "Acciones"].map((h, i) => (
              <th
                key={h}
                className={`px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide ${
                  i === 2 ? "text-right" : "text-left"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {colors.map((c) => (
            <ColorRow key={c.id} color={c} onEdit={onEdit} onToggleActive={onToggleActive} onDelete={onDelete} />
          ))}
        </tbody>
      </table>

      {/* Móvil */}
      <div className="md:hidden">
        {colors.map((c) => (
          <ColorMobileCard key={c.id} color={c} onEdit={onEdit} onToggleActive={onToggleActive} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};

export default ColorList;
