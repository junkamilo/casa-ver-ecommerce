"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";
import { useLaunchCountdown } from "@/hooks/use-launch-countdown";
import { useIsClient } from "@/hooks/use-is-client";

function padTwo(n: number): string {
  return String(n).padStart(2, "0");
}

interface CountdownUnitProps {
  value: number;
  label: string;
}

function CountdownUnit({ value, label }: CountdownUnitProps) {
  const display = label === "Días" ? String(value) : padTwo(value);

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[4.5rem] sm:min-w-[5.5rem]">
      <div
        key={display}
        className="relative w-full rounded-2xl bg-[#154734]/5 border border-[#154734]/10 px-3 py-3 sm:py-4 shadow-sm animate-in zoom-in-95 duration-300"
      >
        <span
          className="block text-center text-3xl sm:text-4xl font-bold text-[#154734] tabular-nums leading-none"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {display}
        </span>
      </div>
      <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#154734]/60">
        {label}
      </span>
    </div>
  );
}

function CountdownSeparator() {
  return (
    <span
      className="text-2xl sm:text-3xl font-bold text-[#C19A6B] pb-6 animate-pulse select-none"
      aria-hidden
    >
      :
    </span>
  );
}

export default function LaunchCountdownModal() {
  const isClient = useIsClient();
  const { days, hours, minutes, seconds, isExpired, launchDateLabel } =
    useLaunchCountdown();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!isClient || isExpired) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="launch-lock-title"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header verde */}
        <div className="bg-[#154734] px-7 pt-8 pb-7 text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, #C19A6B 0%, transparent 70%)",
            }}
          />
          <div className="relative flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src={logoIcon}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
                aria-hidden
              />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C19A6B]">
                Casa Verde
              </span>
            </div>
            <h2
              id="launch-lock-title"
              className="text-3xl sm:text-4xl font-bold text-white leading-tight"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Próximamente
            </h2>
            <p className="mt-2 text-sm text-white/65 max-w-xs mx-auto leading-relaxed">
              Estamos preparando algo especial para ti.
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="px-6 sm:px-8 py-8 bg-[#F9F9F7]">
          <div className="flex items-center justify-center gap-1 sm:gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#C19A6B] shrink-0" />
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#154734]/70 text-center">
              Apertura en
            </p>
            <Sparkles className="w-4 h-4 text-[#C19A6B] shrink-0" />
          </div>

          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <CountdownUnit value={days} label="Días" />
            <CountdownSeparator />
            <CountdownUnit value={hours} label="Horas" />
            <CountdownSeparator />
            <CountdownUnit value={minutes} label="Minutos" />
            <CountdownSeparator />
            <CountdownUnit value={seconds} label="Segundos" />
          </div>

          <p className="mt-8 text-center text-sm text-[#154734]/60 capitalize">
            {launchDateLabel}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
