"use client";

import { useState, useRef, useEffect, useId, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, Check } from "lucide-react";

interface Props {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  searchable?: boolean;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  openUpward: boolean;
}

export default function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Seleccionar",
  disabled = false,
  error,
  searchable = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<DropdownPosition>({ top: 0, left: 0, width: 0, openUpward: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const id = useId();

  const DROPDOWN_MAX_H = 320;
  const GAP = 6; // px entre trigger y panel

  // Calcula posición del dropdown relativa al viewport
  const calcPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUpward = spaceBelow < DROPDOWN_MAX_H && spaceAbove > spaceBelow;

    setPos({
      top: openUpward
        ? rect.top + window.scrollY - DROPDOWN_MAX_H - GAP
        : rect.bottom + window.scrollY + GAP,
      left: rect.left + window.scrollX,
      width: rect.width,
      openUpward,
    });
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    calcPosition();
    setOpen((p) => !p);
  };

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // Cerrar si el click no es en el trigger ni en el panel del portal
      if (containerRef.current && !containerRef.current.contains(target)) {
        // Verificar si el click está en el panel del portal (buscamos por data-attr)
        const panel = document.querySelector(`[data-select-panel="${id}"]`);
        if (!panel || !panel.contains(target)) {
          setOpen(false);
          setQuery("");
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, id]);

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  // Recalcular posición en scroll/resize mientras esté abierto
  useEffect(() => {
    if (!open) return;
    const handler = () => calcPosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open, calcPosition]);

  // Enfocar búsqueda al abrir
  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    if (!open) setQuery("");
  }, [open, searchable]);

  const filtered = query.trim()
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleSelect = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setQuery("");
  };

  // Panel — renderizado via Portal para escapar de cualquier overflow-hidden padre
  const dropdownPanel = open ? (
    <div
      data-select-panel={id}
      role="listbox"
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        width: pos.width,
        maxHeight: DROPDOWN_MAX_H,
        zIndex: 9999,
      }}
      className="bg-white rounded-2xl border border-[#C19A6B]/25 shadow-[0_24px_48px_-12px_rgba(21,71,52,0.22)] flex flex-col"
    >
      {/* Cabecera */}
      <div className="flex-none px-4 pt-3 pb-2 border-b border-gray-100 rounded-t-2xl bg-linear-to-r from-[#154734]/6 to-[#C19A6B]/6">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#154734]/60">
          {label}
        </p>
      </div>

      {/* Buscador */}
      {searchable && (
        <div className="flex-none px-3 py-2.5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2 focus-within:border-[#C19A6B] focus-within:ring-2 focus-within:ring-[#C19A6B]/15 transition-all duration-200">
            <Search className="w-3.5 h-3.5 text-[#C19A6B] shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              className="flex-1 bg-transparent text-sm text-[#154734] placeholder:text-gray-400 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-gray-300 hover:text-gray-500 text-xs leading-none transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Lista */}
      <ul className="flex-1 overflow-y-auto min-h-0">
        {filtered.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-gray-400">
            Sin resultados para &ldquo;{query}&rdquo;
          </li>
        ) : (
          filtered.map((opt) => {
            const selected = opt === value;
            return (
              <li key={opt}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelect(opt)}
                  className={[
                    "w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 transition-colors duration-100",
                    selected
                      ? "bg-[#154734] text-white font-semibold"
                      : "text-[#154734] hover:bg-[#edf3f0]",
                  ].join(" ")}
                >
                  <span className="truncate">{opt}</span>
                  {selected && (
                    <Check className="w-3.5 h-3.5 shrink-0 text-[#C19A6B]" />
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>

      {/* Pie decorativo */}
      <div className="flex-none h-1 rounded-b-2xl bg-linear-to-r from-[#154734] via-[#C19A6B] to-[#154734]" />
    </div>
  ) : null;

  return (
    <div ref={containerRef} className="relative">

      {/* ── Trigger ─────────────────────────────────────────────────── */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={handleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "w-full px-5 pt-6 pb-3 text-left rounded-xl border transition-all duration-300 text-sm outline-none shadow-inner",
          disabled
            ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-50"
            : open
            ? "bg-white border-[#C19A6B] ring-4 ring-[#C19A6B]/15 text-[#154734]"
            : value
            ? "bg-[#FAFAFA] border-gray-200 hover:border-[#C19A6B]/60 text-[#154734] font-medium cursor-pointer"
            : "bg-[#FAFAFA] border-gray-200 hover:border-[#C19A6B]/60 text-gray-400 cursor-pointer",
        ].join(" ")}
      >
        {value || placeholder}
      </button>

      {/* Label flotante */}
      <label
        htmlFor={id}
        className={[
          "absolute left-5 top-2 text-[10px] font-bold uppercase tracking-widest pointer-events-none transition-colors duration-300",
          disabled ? "text-gray-300" : "text-[#C19A6B]",
        ].join(" ")}
      >
        {label}
      </label>

      {/* Chevron */}
      <ChevronDown
        className={[
          "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform duration-300",
          disabled ? "text-gray-300" : "text-[#C19A6B]",
          open ? "rotate-180" : "",
        ].join(" ")}
      />

      {/* Dropdown via Portal — flota sobre todo, nunca clippeado por overflow-hidden */}
      {typeof document !== "undefined" && dropdownPanel
        ? createPortal(dropdownPanel, document.body)
        : null}

      {/* Error */}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium ml-1">{error}</p>
      )}
    </div>
  );
}
