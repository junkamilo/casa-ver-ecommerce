"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  dateTimeLabelClass,
  dateTimePeriodActiveClass,
  dateTimePeriodInactiveClass,
  dateTimePopoverClass,
  dateTimeScrollItemClass,
  dateTimeScrollItemSelectedClass,
  dateTimeTriggerClass,
  dateTimeTriggerDisabledClass,
  dateTimeTriggerOpenClass,
} from "./date-time.tokens";
import {
  buildMinuteOptions,
  formatTimeDisplay24to12,
  HOUR_OPTIONS_12,
  parseTime24to12Parts,
  parseTimeDisplay12to24,
  type TimePeriod,
} from "./date-time.utils";

export type CasaVerdeTimePickerProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  minuteStep?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

export function CasaVerdeTimePicker({
  id: idProp,
  label,
  value,
  onChange,
  minuteStep = 5,
  placeholder = "Selecciona hora",
  disabled = false,
  className,
}: CasaVerdeTimePickerProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const parsed = value ? parseTime24to12Parts(value) : null;
  const [hour12, setHour12] = useState(parsed?.hour12 ?? 9);
  const [minute, setMinute] = useState(parsed?.minute ?? 0);
  const [period, setPeriod] = useState<TimePeriod>(parsed?.period ?? "AM");

  useEffect(() => {
    if (value) {
      const p = parseTime24to12Parts(value);
      if (p) {
        setHour12(p.hour12);
        setMinute(p.minute);
        setPeriod(p.period);
      }
    }
  }, [value]);

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

  const minuteOptions = buildMinuteOptions(minuteStep);

  function applyTime(h: number, m: number, p: TimePeriod) {
    onChange(parseTimeDisplay12to24(h, m, p));
  }

  function handleHourSelect(h: number) {
    setHour12(h);
    applyTime(h, minute, period);
  }

  function handleMinuteSelect(m: number) {
    setMinute(m);
    applyTime(hour12, m, period);
  }

  function handlePeriodSelect(p: TimePeriod) {
    setPeriod(p);
    applyTime(hour12, minute, p);
  }

  const displayValue = value ? formatTimeDisplay24to12(value) : placeholder;

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
        <Clock className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="flex-1 text-left truncate">{displayValue}</span>
      </button>

      {open && !disabled ? (
        <div
          role="dialog"
          aria-label="Selector de hora"
          className={cn(dateTimePopoverClass, "w-[260px]")}
        >
          <p className="text-xs text-gray-500 mb-2">Hora Colombia</p>
          <div className="flex gap-1 mb-3">
            {(["AM", "PM"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePeriodSelect(p)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm transition-colors",
                  period === p ? dateTimePeriodActiveClass : dateTimePeriodInactiveClass
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 max-h-40 overflow-y-auto space-y-0.5 pr-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1 text-center">
                Hora
              </p>
              {HOUR_OPTIONS_12.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourSelect(h)}
                  className={cn(
                    dateTimeScrollItemClass,
                    "w-full",
                    hour12 === h && dateTimeScrollItemSelectedClass
                  )}
                >
                  {h}
                </button>
              ))}
            </div>
            <div className="flex-1 max-h-40 overflow-y-auto space-y-0.5 pr-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1 text-center">
                Min
              </p>
              {minuteOptions.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteSelect(m)}
                  className={cn(
                    dateTimeScrollItemClass,
                    "w-full",
                    minute === m && dateTimeScrollItemSelectedClass
                  )}
                >
                  {String(m).padStart(2, "0")}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
