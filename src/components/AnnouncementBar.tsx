"use client";

import { Truck, Sparkles, ShieldCheck } from "lucide-react";

const announcements = [
  {
    text: "Envíos Gratis a Todo Colombia",
    icon: Truck,
    delay: "0s",
  },
  {
    text: "Actitud y Comodidad en Cada Movimiento",
    icon: Sparkles,
    delay: "1.1s",
  },
  {
    text: "Compra 100% Segura y Garantizada",
    icon: ShieldCheck,
    delay: "2.2s",
  },
];

export default function AnnouncementBar() {
  return (
    <div className="relative w-full select-none">

      {/* ── Línea de borde superior: degradado dorado que respira ── */}
      <div className="animate-border-shimmer h-[1.5px] bg-linear-to-r from-transparent via-[#C19A6B] to-transparent" />

      {/* ══════════════ BARRA PRINCIPAL ══════════════ */}
      <div
        className="relative bg-[#154734] py-2.5 sm:py-3 flex items-center overflow-hidden group"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #154734 0%, #1a5a42 40%, #154734 70%, #122e25 100%)",
        }}
      >

        {/* ── Efecto Aurora: capa de color verde que se mueve de fondo ── */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 80% at 20% 50%, #1d6b4f 0%, transparent 70%), radial-gradient(ellipse 50% 70% at 80% 50%, #0f3a2a 0%, transparent 70%)",
          }}
        />

        {/* ── Barrido de luz dorada: efecto firma de lujo ── */}
        <div
          className="absolute top-0 bottom-0 w-24 sm:w-32 pointer-events-none z-20 animate-shine-sweep"
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(193,154,107,0.18) 50%, transparent 70%)",
            filter: "blur(2px)",
          }}
        />

        {/* ── Fades laterales: desvanecimiento premium ── */}
        <div className="absolute inset-y-0 left-0 w-20 sm:w-36 z-10 pointer-events-none bg-linear-to-r from-[#154734] via-[#154734]/90 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-20 sm:w-36 z-10 pointer-events-none bg-linear-to-l from-[#154734] via-[#154734]/90 to-transparent" />

        {/* ════ MARQUEE ════ */}
        <div
          className="flex whitespace-nowrap animate-marquee group-hover:paused will-change-transform"
          aria-label="Anuncios de la tienda"
        >
          {/* 4 copias → garantiza el loop sin saltos en pantallas ultra-anchas */}
          {[...Array(4)].map((_, arrayIndex) => (
            <div key={arrayIndex} className="flex items-center">
              {announcements.map((item, index) => {
                const Icon = item.icon;
                const floatDelay = `${index * 0.7}s`;
                const glowDelay  = `${index * 0.9}s`;
                const diamDelay  = `${index * 0.5 + 0.4}s`;

                return (
                  <div
                    key={`${arrayIndex}-${index}`}
                    className="flex items-center mx-8 sm:mx-12"
                  >
                    {/* ── Ícono con halo dorado flotante ── */}
                    <div
                      className="relative mr-2.5 sm:mr-3 shrink-0 animate-float"
                      style={{ animationDelay: floatDelay }}
                    >
                      {/* Halo — pulso exterior */}
                      <span
                        className="absolute inset-0 -m-1 rounded-full blur-sm bg-[#C19A6B]/40 animate-glow-pulse"
                        style={{ animationDelay: glowDelay }}
                        aria-hidden="true"
                      />
                      {/* Ícono */}
                      <Icon
                        className="relative w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C19A6B]"
                        style={{
                          filter: "drop-shadow(0 0 5px rgba(193,154,107,0.7))",
                        }}
                        aria-hidden="true"
                      />
                    </div>

                    {/* ── Texto del anuncio ── */}
                    <span
                      className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90"
                      style={{
                        textShadow: "0 0 20px rgba(193,154,107,0.15)",
                      }}
                    >
                      {item.text}
                    </span>

                    {/* ── Separador diamante con líneas laterales ── */}
                    <div className="mx-8 sm:mx-12 flex items-center gap-2 shrink-0">
                      {/* Línea izquierda */}
                      <div className="w-4 sm:w-6 h-px bg-linear-to-r from-transparent to-[#C19A6B]/40" />

                      {/* Diamante central que respira */}
                      <div
                        className="w-1.5 h-1.5 animate-diamond-breathe"
                        style={{
                          background: "#C19A6B",
                          transform: "rotate(45deg)",
                          boxShadow: "0 0 6px 1px rgba(193,154,107,0.6)",
                          animationDelay: diamDelay,
                        }}
                        aria-hidden="true"
                      />

                      {/* Línea derecha */}
                      <div className="w-4 sm:w-6 h-px bg-linear-to-l from-transparent to-[#C19A6B]/40" />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* ════ / MARQUEE ════ */}

      </div>
      {/* ══════════════ / BARRA PRINCIPAL ══════════════ */}

      {/* ── Línea de borde inferior: degradado más sutil ── */}
      <div className="h-px bg-linear-to-r from-transparent via-[#C19A6B]/35 to-transparent" />

    </div>
  );
}
