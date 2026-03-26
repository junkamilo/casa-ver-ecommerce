"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

type SelectOption = string | { value: string; label: string };

interface AdminSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  icon?: React.ReactNode;
  className?: string;
  placeholder?: string;
}

function getOptValue(opt: SelectOption) {
  return typeof opt === "string" ? opt : opt.value;
}
function getOptLabel(opt: SelectOption) {
  return typeof opt === "string" ? opt : opt.label;
}

export default function AdminSelect({
  value,
  onChange,
  options,
  icon,
  className = "",
  placeholder,
}: AdminSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center gap-2 pl-2.5 pr-2 py-2 bg-gray-50 border rounded-xl text-xs sm:text-sm font-medium text-gray-700 cursor-pointer transition-all focus:outline-none focus:ring-4 focus:ring-[#154734]/10 ${
          open
            ? "border-[#154734] bg-white ring-4 ring-[#154734]/10"
            : "border-gray-200 hover:border-[#154734]"
        }`}
      >
        {icon && (
          <span className="text-gray-400 flex-shrink-0">{icon}</span>
        )}
        <span className="flex-1 text-left truncate">
          {options.find((o) => getOptValue(o) === value)
            ? getOptLabel(options.find((o) => getOptValue(o) === value)!)
            : placeholder ?? value}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-lg py-1 overflow-hidden">
          {options.map((opt) => {
            const optVal = getOptValue(opt);
            const optLabel = getOptLabel(opt);
            const isSelected = value === optVal;
            return (
              <button
                key={optVal}
                type="button"
                onClick={() => {
                  onChange(optVal);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 text-xs sm:text-sm transition-colors ${
                  isSelected
                    ? "bg-[#154734]/5 text-[#154734] font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="truncate text-left">{optLabel}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#154734] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
