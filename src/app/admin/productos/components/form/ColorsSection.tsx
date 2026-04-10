"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { ColorsSectionProps } from "../../types";
import { PRESET_COLORS, SIZES, MAX_IMAGES_PER_COLOR } from "../../constants";
import ImageUpload from "@/components/ui/image-upload";
import FieldError from "../shared/FieldError";
import SectionTitle from "./SectionTitle";

export default function ColorsSection({
  selectedColors,
  selectedSizes,
  disabled,
  colorError,
  sizeError,
  onToggleColor,
  onToggleSize,
  onSetColorImages,
}: ColorsSectionProps) {
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

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setOpen(false);
      if (sizesDropdownRef.current && !sizesDropdownRef.current.contains(e.target as Node))
        setSizesOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAddImages = (colorName: string, existingImages: string[], newUrls: string[]) => {
    const merged = [...existingImages];
    for (const url of newUrls) {
      if (!merged.includes(url) && merged.length < MAX_IMAGES_PER_COLOR) {
        merged.push(url);
      }
    }
    onSetColorImages(colorName, merged);
  };

  const handleRemoveImage = (colorName: string, existingImages: string[], urlToRemove: string) => {
    onSetColorImages(colorName, existingImages.filter((u) => u !== urlToRemove));
  };

  const handleSetCover = (colorName: string, existingImages: string[], coverUrl: string) => {
    const rest = existingImages.filter((u) => u !== coverUrl);
    onSetColorImages(colorName, [coverUrl, ...rest]);
  };

  return (
    <section className="space-y-4">
      <SectionTitle>Colores y Tallas</SectionTitle>

      {/* ── Colores ────────────────────────────────────────────── */}
      <div
        className={`bg-gray-50 rounded-xl border p-4 space-y-3 transition-colors ${
          colorError ? "border-red-400 bg-red-50/30" : "border-gray-200"
        }`}
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Colores disponibles <span className="text-red-500">*</span>
        </p>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen((v) => !v)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border bg-white text-sm text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              colorError ? "border-red-400" : "border-gray-200"
            }`}
          >
            <span className="flex items-center gap-2 flex-wrap">
              {selectedColors.length === 0 ? (
                <span className={colorError ? "text-red-400" : "text-gray-400"}>
                  Seleccionar colores…
                </span>
              ) : (
                selectedColors.map((c) => (
                  <span
                    key={c.name}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#154734]/10 text-[#154734] text-xs font-medium"
                  >
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

        <FieldError msg={colorError} withIcon />
      </div>

      {/* ── Imágenes por color ─────────────────────────────────── */}
      {selectedColors.length > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Imágenes por color{" "}
            <span className="text-gray-400 font-normal normal-case tracking-normal">
              — hasta {MAX_IMAGES_PER_COLOR} por color
            </span>
          </p>
          {selectedColors.map((color) => {
            const collapsed = collapsedColors.has(color.name);
            const atLimit = color.images.length >= MAX_IMAGES_PER_COLOR;
            return (
              <div
                key={color.name}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
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
                      <span className={`text-xs ${atLimit ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
                        {color.images.length}/{MAX_IMAGES_PER_COLOR} foto{color.images.length !== 1 ? "s" : ""}
                        {atLimit && " (límite)"}
                      </span>
                    )}
                  </div>
                  {collapsed ? (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>

                {!collapsed && (
                  <div className="px-3 pb-3 border-t border-gray-100 pt-3">
                    <ImageUpload
                      value={color.images}
                      disabled={disabled || atLimit}
                      onChange={(urls) => handleAddImages(color.name, color.images, urls)}
                      onRemove={(url) => handleRemoveImage(color.name, color.images, url)}
                      onSetCover={(url) => handleSetCover(color.name, color.images, url)}
                      maxImages={MAX_IMAGES_PER_COLOR}
                      colorInfo={{ name: color.name, hexCode: color.hexCode }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tallas ─────────────────────────────────────────────── */}
      <div
        className={`bg-gray-50 rounded-xl border p-4 space-y-3 transition-colors ${
          sizeError ? "border-red-400 bg-red-50/30" : "border-gray-200"
        }`}
      >
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Tallas disponibles <span className="text-red-500">*</span>
        </p>

        <div className="relative" ref={sizesDropdownRef}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setSizesOpen((v) => !v)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border bg-white text-sm text-gray-700 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              sizeError ? "border-red-400" : "border-gray-200"
            }`}
          >
            <span className="flex items-center gap-2 flex-wrap">
              {selectedSizes.length === 0 ? (
                <span className={sizeError ? "text-red-400" : "text-gray-400"}>
                  Seleccionar tallas…
                </span>
              ) : (
                selectedSizes.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-full bg-[#154734] text-white text-xs font-bold"
                  >
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

        <FieldError msg={sizeError} withIcon />
      </div>
    </section>
  );
}
