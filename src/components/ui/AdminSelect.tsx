"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

interface AdminSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  icon?: React.ReactNode;
  className?: string;
}

export default function AdminSelect({
  value,
  onChange,
  options,
  icon,
  className = "",
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
        <span className="flex-1 text-left truncate">{value}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 left-0 min-w-full w-max bg-white border border-gray-200 rounded-xl shadow-lg py-1 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-xs sm:text-sm transition-colors ${
                value === opt
                  ? "bg-[#154734]/5 text-[#154734] font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{opt}</span>
              {value === opt && <Check className="w-3.5 h-3.5 text-[#154734] flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
