"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { SelectedColor } from "../../types";
import { PRESET_COLORS, SIZES } from "../../constants";
import ImageUpload from "@/components/ui/image-upload";

interface Props {
  selectedColors: SelectedColor[];
  selectedSizes: string[];
  disabled: boolean;
  onToggleColor: (name: string, hexCode: string) => void;
  onToggleSize: (size: string) => void;
  onSetColorImages: (colorName: string, images: string[]) => void;
}

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide">
    {children}
  </h3>
);

export default function ColorsSection({
  selectedColors,
  selectedSizes,
  disabled,
  onToggleColor,
  onToggleSize,
  onSetColorImages,
}: Props) {
  const [open, setOpen] = useState(false);
  const [sizesOpen, setSizesOpen] = useState(false);
  const [collapsedColors, setCollapsedColors] = useState<Set<string>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sizesDropdownRef = useRef<HTMLDivElement>(null);

  const toggleCollapse = (name: string) =>
    setCollapsedColors((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  const isColorSelected = (name: string) =>
    selectedColors.some((c) => c.name === name);

  // Cierra dropdowns al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (sizesDropdownRef.current && !sizesDropdownRef.current.contains(e.target as Node)) {
        setSizesOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <section className="space-y-4">
      <SectionTitle>Colores y Tallas</SectionTitle>

      {/* Color picker — dropdown con scroll */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Colores disponibles
        </p>

        <div className="relative" ref={dropdownRef}>
          {/* Trigger */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2 flex-wrap">
              {selectedColors.length === 0 ? (
                <span className="text-gray-400">Seleccionar colores…</span>
              ) : (
                selectedColors.map((c) => (
                  <span key={c.name} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#154734]/10 text-[#154734] text-xs font-medium">
                    <span
                      className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: c.hexCode }}
                    />
                    {c.name}
                  </span>
                ))
              )}
            </span>
            {open ? (
              <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
            )}
          </button>

          {/* Panel desplegable con scroll vertical */}
          {open && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-y-auto max-h-52 p-2 space-y-0.5">
                {PRESET_COLORS.map((preset) => {
                  const selected = isColorSelected(preset.name);
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => onToggleColor(preset.name, preset.hex)}
                      disabled={disabled}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selected
                          ? "bg-[#154734]/8 text-[#154734]"
                          : "text-gray-700 hover:bg-gray-50"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span className="flex-1 text-left">{preset.name}</span>
                      {selected && <Check className="w-4 h-4 text-[#154734] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Imágenes por color */}
      {selectedColors.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Imágenes por color
          </p>
          {selectedColors.map((color) => {
            const collapsed = collapsedColors.has(color.name);
            return (
              <div key={color.name} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header colapsable */}
                <button
                  type="button"
                  onClick={() => toggleCollapse(color.name)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: color.hexCode }}
                    />
                    <span className="text-sm font-semibold text-gray-700">{color.name}</span>
                    {color.images.length > 0 && (
                      <span className="text-xs text-gray-400">
                        {color.images.length} foto{color.images.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {collapsed ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {/* Contenido expandido */}
                {!collapsed && (
                  <div className="px-3 pb-3 border-t border-gray-100 pt-3">
                    <ImageUpload
                      value={color.images}
                      disabled={disabled}
                      onChange={(urls) => onSetColorImages(color.name, [...color.images, ...urls])}
                      onRemove={(url) => onSetColorImages(color.name, color.images.filter((i) => i !== url))}
                      maxImages={8}
                      colorInfo={{ name: color.name, hexCode: color.hexCode }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Size picker — dropdown con scroll */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Tallas disponibles
        </p>

        <div className="relative" ref={sizesDropdownRef}>
          {/* Trigger */}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setSizesOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2 flex-wrap">
              {selectedSizes.length === 0 ? (
                <span className="text-gray-400">Seleccionar tallas…</span>
              ) : (
                selectedSizes.map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-full bg-[#154734] text-white text-xs font-bold">
                    {s}
                  </span>
                ))
              )}
            </span>
            {sizesOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
            )}
          </button>

          {/* Panel desplegable con scroll vertical */}
          {sizesOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-y-auto max-h-52 p-2 space-y-0.5">
                {SIZES.map((size) => {
                  const active = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => onToggleSize(size)}
                      disabled={disabled}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                        active
                          ? "bg-[#154734]/8 text-[#154734]"
                          : "text-gray-700 hover:bg-gray-50"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span>{size}</span>
                      {active && <Check className="w-4 h-4 text-[#154734] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
