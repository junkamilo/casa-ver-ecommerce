"use client";

import { Pencil, Trash2, Tag, Loader2 } from "lucide-react";
import type { GarmentTypeListProps, GarmentType } from "../types/types";

// ── Toggle ─────────────────────────────────────────────────────────────────────
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

// ── Fila desktop ───────────────────────────────────────────────────────────────
const GarmentTypeRow = ({
  gt,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  gt: GarmentType;
  onEdit: (gt: GarmentType) => void;
  onToggleActive: (gt: GarmentType) => void;
  onDelete: (gt: GarmentType) => void;
}) => {
  const total = (gt._count?.products ?? 0) + (gt._count?.categories ?? 0);

  return (
    <tr className="hover:bg-gray-50/60 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#154734]/8 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4 text-[#154734]" />
          </div>
          <p className="text-sm font-semibold text-gray-900">{gt.name}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs font-mono text-gray-400">{gt.slug}</span>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {total} producto{total !== 1 ? "s" : ""}
        </span>
      </td>
      <td className="px-6 py-4">
        <Toggle active={gt.isActive} onToggle={() => onToggleActive(gt)} />
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onEdit(gt)}
            title="Editar"
            className="p-2 text-gray-400 hover:text-[#C19A6B] bg-gray-50 rounded-lg transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(gt)}
            title="Eliminar"
            disabled={total > 0}
            className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// ── Tarjeta móvil ──────────────────────────────────────────────────────────────
const GarmentTypeMobileCard = ({
  gt,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  gt: GarmentType;
  onEdit: (gt: GarmentType) => void;
  onToggleActive: (gt: GarmentType) => void;
  onDelete: (gt: GarmentType) => void;
}) => {
  const total = (gt._count?.products ?? 0) + (gt._count?.categories ?? 0);

  return (
    <div className="p-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#154734]/8 flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4 text-[#154734]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{gt.name}</p>
            <p className="text-[11px] font-mono text-gray-400">{gt.slug}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 mt-1">
              {total} producto{total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Toggle active={gt.isActive} onToggle={() => onToggleActive(gt)} />
          <button
            type="button"
            onClick={() => onEdit(gt)}
            className="p-2 text-gray-400 hover:text-[#C19A6B] bg-gray-50 rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(gt)}
            disabled={total > 0}
            className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Componente principal ───────────────────────────────────────────────────────
const GarmentTypeList = ({
  loading,
  garmentTypes,
  onEdit,
  onToggleActive,
  onDelete,
}: GarmentTypeListProps) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 py-20 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#154734]" />
      </div>
    );
  }

  if (garmentTypes.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 text-center py-16">
        <div className="w-14 h-14 bg-[#154734]/8 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Tag className="w-7 h-7 text-[#154734]/40" />
        </div>
        <p className="text-gray-500 font-medium mb-1">Sin tipos de prenda</p>
        <p className="text-sm text-gray-400">
          Crea el primer tipo de prenda para asignarlo a las categorías.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop */}
      <div className="hidden md:block overflow-auto max-h-150">
      <table className="w-full">
        <thead>
          <tr className="bg-[#F8F9FA] border-b border-gray-200">
            {["Nombre", "Slug", "Productos", "Estado", "Acciones"].map((h, i) => (
              <th
                key={h}
                className={`sticky top-0 z-20 bg-[#F8F9FA] px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wide shadow-[0_1px_0_0_rgba(229,231,235,1)] ${
                  i === 4 ? "text-right" : "text-left"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {garmentTypes.map((gt) => (
            <GarmentTypeRow
              key={gt.id}
              gt={gt}
              onEdit={onEdit}
              onToggleActive={onToggleActive}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
      </div>

      {/* Móvil */}
      <div className="md:hidden">
        {garmentTypes.map((gt) => (
          <GarmentTypeMobileCard
            key={gt.id}
            gt={gt}
            onEdit={onEdit}
            onToggleActive={onToggleActive}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default GarmentTypeList;
