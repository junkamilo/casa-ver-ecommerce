"use client";

import { CircleXIcon, SearchIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  onClear?: () => void;
  className?: string;
  id?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder = "Buscar…",
  ariaLabel,
  onClear,
  className,
  id,
}: SearchFieldProps) {
  const handleClear = () => {
    if (onClear) onClear();
    else onChange("");
  };

  return (
    <div className={cn("relative w-full group", className)}>
      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
        <SearchIcon
          size={20}
          className="text-gray-400 group-focus-within:text-[#C19A6B] transition-colors"
        />
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className={cn(
          "w-full pl-14 py-4 bg-white border border-gray-100 rounded-2xl text-sm",
          "focus:outline-none focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/10",
          "transition-all shadow-sm hover:shadow-md text-[#154734] font-medium",
          "placeholder:font-normal placeholder:text-gray-400",
          value ? "pr-12" : "pr-6",
        )}
      />
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-red-500 hover:text-red-600 transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <CircleXIcon size={18} />
        </button>
      ) : null}
    </div>
  );
}
