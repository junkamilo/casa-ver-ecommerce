import Link from "next/link";
import { HOVER_BRAND, megaMenuData, TEXT_BRAND } from "../constants/constants";

interface Props {
  visible: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onClose: () => void;
}

// Delays escalonados para que cada columna entre con un pequeño retraso
const COLUMN_DELAYS = ["0ms", "60ms", "120ms", "180ms"];

export default function MegaMenu({ visible, onEnter, onLeave, onClose }: Props) {
  return (
    <div
      className={`hidden lg:block absolute top-full left-0 w-full bg-background/97 backdrop-blur-xl border-b border-border/30 shadow-premium-lg transition-all duration-350 ease-out z-40 overflow-hidden ${
        visible ? "opacity-100 visible max-h-105" : "opacity-0 invisible max-h-0"
      }`}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {/* ── Línea dorada superior — efecto que respira ── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#C19A6B]/70 to-transparent animate-border-shimmer" />

      {/* ── Barrido de luz dorada — firma de lujo ── */}
      <div
        className={`absolute top-0 bottom-0 w-32 pointer-events-none z-20 ${visible ? "animate-shine-sweep" : ""}`}
        style={{
          background:
            "linear-gradient(105deg, transparent 30%, rgba(193,154,107,0.1) 50%, transparent 70%)",
          filter: "blur(3px)",
        }}
        aria-hidden="true"
      />

      {/* ── Degradado sutil en el fondo — Aurora verde ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 100% at 50% 0%, #154734 0%, transparent 80%)",
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-8 py-10 relative">
        <div className="grid grid-cols-4 gap-8">
          {megaMenuData.map((column, colIdx) => (
            <div
              key={column.title}
              className={`flex flex-col gap-4 transition-all duration-400 ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              }`}
              style={{ transitionDelay: visible ? COLUMN_DELAYS[colIdx] : "0ms" }}
            >
              {/* Título de columna con línea dorada superior */}
              <div>
                <div className="h-px w-8 bg-linear-to-r from-[#C19A6B] to-[#C19A6B]/20 mb-3" />
                <h3
                  className={`text-xs font-bold tracking-[0.2em] ${TEXT_BRAND} uppercase pb-2`}
                >
                  {column.title}
                </h3>
              </div>

              <div className="flex flex-col gap-3">
                {column.items.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/collections/${item.slug}`}
                    className={`relative group flex items-center gap-2 text-sm text-foreground/80 ${HOVER_BRAND} transition-all duration-200 pl-3`}
                    onClick={onClose}
                  >
                    {/* Barra dorada izquierda que aparece en hover */}
                    <span
                      className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-[#C19A6B] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-top rounded-full"
                      aria-hidden="true"
                    />
                    {/* Dot dorado */}
                    <span
                      className="w-1 h-1 rounded-full bg-[#C19A6B]/0 group-hover:bg-[#C19A6B] transition-all duration-200 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">
                      {item.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Línea dorada inferior sutil ── */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#C19A6B]/20 to-transparent" />
    </div>
  );
}
