"use client";

import { useRef, useEffect, useCallback, useState } from "react";

/* ── Logos como JSX (HTML + SVG geométrico, sin <text> en SVG) ─────────── */

function GooglePayLogo() {
  return (
    <div className="flex items-center gap-[2px]">
      {/* G multicolor */}
      <span className="font-bold text-[15px] leading-none" style={{ color: "#4285F4" }}>G</span>
      <span className="font-bold text-[15px] leading-none" style={{ color: "#EA4335" }}>o</span>
      <span className="font-bold text-[15px] leading-none" style={{ color: "#FBBC05" }}>o</span>
      <span className="font-bold text-[15px] leading-none" style={{ color: "#4285F4" }}>g</span>
      <span className="font-bold text-[15px] leading-none" style={{ color: "#34A853" }}>l</span>
      <span className="font-bold text-[15px] leading-none" style={{ color: "#EA4335" }}>e</span>
      <span className="ml-1 font-medium text-[15px] leading-none text-gray-500">Pay</span>
    </div>
  );
}

function ApplePayLogo() {
  return (
    <div className="flex items-center gap-1.5">
      {/* Apple símbolo Unicode */}
      <span className="text-[18px] leading-none text-gray-900" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>

      </span>
      <span className="font-semibold text-[15px] leading-none text-gray-900">Pay</span>
    </div>
  );
}

function PayPalLogo() {
  return (
    <div className="flex items-center">
      <span className="font-bold text-[15px] leading-none" style={{ color: "#003087" }}>Pay</span>
      <span className="font-bold text-[15px] leading-none" style={{ color: "#009cde" }}>Pal</span>
    </div>
  );
}

function MastercardLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* Dos círculos superpuestos */}
      <svg viewBox="0 0 42 28" className="h-7 w-auto" fill="none">
        <circle cx="14" cy="14" r="13" fill="#EB001B" />
        <circle cx="28" cy="14" r="13" fill="#F79E1B" />
        {/* Intersección naranja */}
        <path
          d="M21 4.8a13 13 0 0 1 0 18.4A13 13 0 0 1 21 4.8z"
          fill="#FF5F00"
        />
      </svg>
      <span className="font-bold text-[11px] leading-tight text-gray-700 lowercase tracking-tight">
        master<br />card
      </span>
    </div>
  );
}

function VisaLogo() {
  return (
    <span
      className="font-black text-[20px] leading-none tracking-tight italic"
      style={{ color: "#1A1F71", fontFamily: "Arial Black, sans-serif" }}
    >
      VISA
    </span>
  );
}

function DinersLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* Círculo con línea vertical — símbolo Diners */}
      <svg viewBox="0 0 28 28" className="h-7 w-auto" fill="none">
        <circle cx="14" cy="14" r="12.5" stroke="#004A97" strokeWidth="2" />
        <ellipse cx="11" cy="14" rx="7" ry="9.5" stroke="#004A97" strokeWidth="1.5" />
        <ellipse cx="17" cy="14" rx="7" ry="9.5" stroke="#004A97" strokeWidth="1.5" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className="font-bold text-[11px] text-[#004A97]">Diners</span>
        <span className="font-medium text-[10px] text-[#004A97]">Club</span>
      </div>
    </div>
  );
}

function PSELogo() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center justify-center w-9 h-7 rounded-md" style={{ backgroundColor: "#00843D" }}>
        <span className="font-black text-[12px] text-white tracking-tight">PSE</span>
      </div>
      <span className="font-semibold text-[12px] text-gray-600">Banco</span>
    </div>
  );
}

function NequiLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ backgroundColor: "#6B21A8" }}>
        <span className="font-black text-[11px] text-white">N</span>
      </div>
      <span className="font-bold text-[15px] leading-none" style={{ color: "#6B21A8" }}>nequi</span>
    </div>
  );
}

/* ── Lista de métodos ────────────────────────────────────────────────────── */

export const PAYMENT_METHODS = [
  { id: "gpay",       label: "Google Pay",   Logo: GooglePayLogo  },
  { id: "apple",      label: "Apple Pay",    Logo: ApplePayLogo   },
  { id: "paypal",     label: "PayPal",       Logo: PayPalLogo     },
  { id: "mastercard", label: "Mastercard",   Logo: MastercardLogo },
  { id: "visa",       label: "Visa",         Logo: VisaLogo       },
  { id: "diners",     label: "Diners Club",  Logo: DinersLogo     },
  { id: "pse",        label: "PSE",          Logo: PSELogo        },
  { id: "nequi",      label: "Nequi",        Logo: NequiLogo      },
];

// Duplicamos para loop infinito sin saltos
const ITEMS = [...PAYMENT_METHODS, ...PAYMENT_METHODS];

/* ── Componente ──────────────────────────────────────────────────────────── */

export default function PaymentCarousel() {
  const scrollRef  = useRef<HTMLDivElement>(null);
  const animRef    = useRef<number>(0);
  const pausedRef  = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const animate = useCallback(() => {
    const el = scrollRef.current;
    if (el && !pausedRef.current) {
      el.scrollLeft += 0.6;
      if (el.scrollLeft >= el.scrollWidth / 2) {
        el.scrollLeft -= el.scrollWidth / 2;
      }
    }
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  return (
    <div className="mb-7">
      <p className="text-center text-[9px] uppercase tracking-[0.25em] font-bold text-gray-300 mb-3">
        Medios de pago aceptados
      </p>

      {/* ── Carrusel animado — todos los dispositivos ───────────────────── */}
      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10" />
        <div
          ref={scrollRef}
          className="flex gap-3 select-none"
          style={{ overflow: "hidden" }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {ITEMS.map(({ id, label, Logo }, i) => (
            <div
              key={`${id}-${i}`}
              aria-label={label}
              className="shrink-0 flex items-center justify-center h-11 px-4 bg-white border border-gray-100 rounded-xl shadow-sm"
            >
              <Logo />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
