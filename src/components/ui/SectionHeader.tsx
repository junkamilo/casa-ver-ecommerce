import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  /** Texto principal del título */
  title: string;
  /** Texto en cursiva (opcional) */
  titleItalic?: string;
  /** Ruta del enlace "Ver todo" */
  href: string;
  /** Texto del enlace (default: "VER TODO") */
  linkText?: string;
  /** Clase Tailwind para el color del texto (ej. "text-[#154734]") */
  textColor?: string;
  /** Clase Tailwind para el color de hover (ej. "hover:text-[#C19A6B]") */
  hoverColor?: string;
  /** Clase Tailwind para el color de la fuente (ej. "font-light") */
  fontClass?: string;
}

const SectionHeader = ({
  title,
  titleItalic,
  href,
  linkText = "VER TODO",
  textColor = "text-[#154734]",
  hoverColor = "hover:text-[#C19A6B]",
  fontClass = "font-light",
}: SectionHeaderProps) => {
  return (
    <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 md:gap-4 w-full mb-6 sm:mb-8 md:mb-10 lg:mb-12">
      {/* ── Título principal con opcional cursiva ── */}
      <h2
        className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl ${fontClass} ${textColor} leading-tight flex-shrink whitespace-normal`}
        style={{ fontFamily: "Georgia, serif" }}
      >
        {title}
        {titleItalic && (
          <span className="italic ml-1.5 sm:ml-2 md:ml-3" style={{ color: "#C19A6B" }}>
            {titleItalic}
          </span>
        )}
      </h2>

      {/* ── Enlace "Ver todo" con flecha moderna ── */}
      <Link
        href={href}
        className={`group inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] md:text-xs font-black tracking-widest uppercase ${textColor} ${hoverColor} transition-colors duration-300 p-1 sm:p-2 touch-target active:scale-95 flex-shrink-0 whitespace-nowrap`}
      >
        <span>{linkText}</span>
        {/* Flecha con animación sutil */}
        <ArrowRight
          className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 group-hover:translate-x-0.5 transition-transform duration-300 ease-out"
          strokeWidth={2.5}
        />
      </Link>
    </div>
  );
};

export default SectionHeader;
