"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  dateTimeDayBaseClass,
  dateTimeDayDefaultClass,
  dateTimeDayDisabledClass,
  dateTimeDayOutsideClass,
  dateTimeDaySelectedClass,
  dateTimeDayTodayClass,
  dateTimeLabelClass,
  dateTimeNavButtonClass,
  dateTimePopoverClass,
  dateTimeTriggerClass,
  dateTimeTriggerDisabledClass,
  dateTimeTriggerOpenClass,
} from "./date-time.tokens";
import {
  formatDateDisplay,
  getBogotaTodayIso,
  getCalendarDays,
  isDateBefore,
  MONTH_NAMES_ES,
  parseIsoDate,
  WEEKDAY_LABELS_ES,
} from "./date-time.utils";

export type CasaVerdeDatePickerProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function CasaVerdeDatePicker({
  id: idProp,
  label,
  value,
  onChange,
  minDate,
  placeholder = "Selecciona una fecha",
  disabled = false,
  className,
}: CasaVerdeDatePickerProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const todayIso = getBogotaTodayIso();
  const effectiveMin = minDate ?? todayIso;

  const initial = parseIsoDate(value) ?? parseIsoDate(todayIso)!;
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.monthIndex);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      const parsed = parseIsoDate(value);
      if (parsed) {
        setViewYear(parsed.year);
        setViewMonth(parsed.monthIndex);
      }
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const days = getCalendarDays(viewYear, viewMonth);

  function goPrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function goNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function handleSelect(iso: string, inMonth: boolean) {
    if (!inMonth || isDateBefore(iso, effectiveMin)) return;
    onChange(iso);
    setOpen(false);
  }

  const displayValue = value ? formatDateDisplay(value) : placeholder;

  return (
    <div ref={ref} className={cn("relative space-y-1.5", className)}>
      {label ? (
        <label htmlFor={id} className={dateTimeLabelClass}>
          {label}
        </label>
      ) : null}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          dateTimeTriggerClass,
          open && dateTimeTriggerOpenClass,
          disabled && dateTimeTriggerDisabledClass,
          !value && "text-gray-400"
        )}
      >
        <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="flex-1 text-left truncate">{displayValue}</span>
      </button>

      {open && !disabled ? (
        <div
          role="dialog"
          aria-label="Calendario"
          className={cn(dateTimePopoverClass, "w-[280px]")}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={goPrevMonth}
              className={dateTimeNavButtonClass}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-gray-800 capitalize">
              {MONTH_NAMES_ES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={goNextMonth}
              className={dateTimeNavButtonClass}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS_ES.map((wd) => (
              <div
                key={wd}
                className="h-8 flex items-center justify-center text-xs font-semibold text-gray-400"
              >
                {wd}
              </div>
            ))}
          </div>

          <div role="grid" className="grid grid-cols-7 gap-1">
            {days.map((cell) => {
              const isSelected = value === cell.iso;
              const isToday = cell.iso === todayIso;
              const isDisabled =
                !cell.inMonth || isDateBefore(cell.iso, effectiveMin);

              return (
                <button
                  key={`${cell.iso}-${cell.inMonth}`}
                  type="button"
                  role="gridcell"
                  disabled={isDisabled}
                  onClick={() => handleSelect(cell.iso, cell.inMonth)}
                  className={cn(
                    dateTimeDayBaseClass,
                    isSelected && dateTimeDaySelectedClass,
                    !isSelected && isDisabled && dateTimeDayDisabledClass,
                    !isSelected &&
                      !isDisabled &&
                      cell.inMonth &&
                      dateTimeDayDefaultClass,
                    !isSelected && !cell.inMonth && dateTimeDayOutsideClass,
                    !isSelected && isToday && cell.inMonth && dateTimeDayTodayClass
                  )}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
