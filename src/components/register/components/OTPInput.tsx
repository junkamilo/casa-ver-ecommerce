"use client";

import { useRef, useState, KeyboardEvent, ClipboardEvent } from "react";

interface OTPInputProps {
  onComplete: (code: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  onReset?: () => void;
}

const LENGTH = 6;

export default function OTPInput({ onComplete, disabled, hasError, onReset }: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(LENGTH).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const focusNext = (index: number) => inputs.current[index + 1]?.focus();
  const focusPrev = (index: number) => inputs.current[index - 1]?.focus();

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;

    onReset?.();

    const next = [...values];
    next[index] = digit;
    setValues(next);

    if (index < LENGTH - 1) {
      focusNext(index);
    }

    if (next.every((v) => v !== "")) {
      onComplete(next.join(""));
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      onReset?.();
      if (values[index]) {
        const next = [...values];
        next[index] = "";
        setValues(next);
      } else if (index > 0) {
        focusPrev(index);
        const next = [...values];
        next[index - 1] = "";
        setValues(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusPrev(index);
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      focusNext(index);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    onReset?.();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;

    const next = Array(LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      if (i < LENGTH) next[i] = char;
    });
    setValues(next);
    const lastFilled = Math.min(pasted.length - 1, LENGTH - 1);
    inputs.current[lastFilled]?.focus();

    if (pasted.length === LENGTH) {
      onComplete(pasted);
    }
  };

  const reset = () => {
    setValues(Array(LENGTH).fill(""));
    inputs.current[0]?.focus();
  };

  // Exponer reset para uso externo si es necesario
  (OTPInput as any)._reset = reset;

  return (
    <div className="flex gap-2 sm:gap-3 justify-center">
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={val}
          autoFocus={i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          aria-label={`Dígito ${i + 1} del código`}
          className={[
            "w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none select-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            hasError
              ? "border-red-400 bg-red-50 text-red-700 animate-shake"
              : val
              ? "border-[#154734] bg-[#154734]/5 text-[#154734]"
              : "border-gray-200 bg-white text-gray-800",
            "focus:border-[#154734] focus:ring-2 focus:ring-[#154734]/20",
          ].join(" ")}
        />
      ))}
    </div>
  );
}
