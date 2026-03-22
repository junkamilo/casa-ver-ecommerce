import Image from "next/image";
import { Leaf, type LucideIcon } from "lucide-react";
import AuthTopBar from "@/components/ui/AuthTopBar";

// ─── BenefitItem: fila reutilizable del panel derecho ────────────────────────
interface BenefitItemProps {
  icon: LucideIcon;
  text: string;
  step?: number;
}

export const BenefitItem = ({ icon: Icon, text, step }: BenefitItemProps) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 w-5 h-5 rounded-full bg-[#C19A6B]/25 border border-[#C19A6B]/55 flex items-center justify-center shrink-0">
      <Icon className="w-3 h-3 text-[#C19A6B]" />
    </div>
    <div className="flex items-center gap-2">
      {step !== undefined && (
        <span className="text-[#C19A6B] text-xs font-bold">{step}.</span>
      )}
      <span className="text-white/80 text-sm leading-snug">{text}</span>
    </div>
  </div>
);

// ─── AuthLayout ───────────────────────────────────────────────────────────────
interface AuthLayoutProps {
  /** Formulario (panel izquierdo) */
  children: React.ReactNode;
  /** Texto encima del logo en el panel derecho */
  eyebrow: string;
  /** Cita o descripción en cursiva */
  tagline: React.ReactNode;
  /** Lista de beneficios / pasos (panel derecho) */
  rightItems: React.ReactNode;
  /** Centra verticalmente el formulario (default: true) */
  formCenter?: boolean;
  /** Props de AuthTopBar */
  backHref?: string;
  backLabel?: string;
}

const AuthLayout = ({
  children,
  eyebrow,
  tagline,
  rightItems,
  formCenter = true,
  backHref,
  backLabel,
}: AuthLayoutProps) => (
  <div className="flex flex-col lg:flex-row lg:h-dvh">

    {/* ── PANEL IZQUIERDO ─── */}
    <div className="w-full lg:w-[55%] bg-white flex flex-col lg:h-dvh">
      <AuthTopBar backHref={backHref} backLabel={backLabel} />

      <div
        className={`flex-1 overflow-y-auto scrollbar-brand px-4 sm:px-10 py-8 flex flex-col items-center${
          formCenter ? " justify-center" : ""
        } bg-gray-50 lg:bg-white`}
      >
        <div className="w-full max-w-md bg-white lg:bg-transparent rounded-2xl lg:rounded-none shadow-[0_2px_24px_rgba(0,0,0,0.07)] lg:shadow-none border border-gray-100 lg:border-none px-5 py-7 lg:px-0 lg:py-0">
          {children}
        </div>
      </div>
    </div>

    {/* ── PANEL DERECHO (desktop) ─── */}
    <div className="hidden lg:flex lg:sticky lg:top-0 lg:w-[45%] lg:h-dvh relative overflow-hidden">

      {/* Imagen de fondo */}
      <Image
        src="/heroImage2.jpg"
        alt="Colección Casa Verde"
        fill
        className="object-cover"
        priority
      />

      {/* Gradiente overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-[#154734]/88 via-[#154734]/72 to-[#0a2218]/92" />

      {/* Hojas decorativas */}
      <div className="absolute -bottom-20 -right-20 opacity-[0.07] pointer-events-none">
        <Leaf className="w-80 h-80 text-white" />
      </div>
      <div className="absolute -top-10 -left-10 rotate-200 opacity-[0.07] pointer-events-none">
        <Leaf className="w-56 h-56 text-white" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 py-12 text-white h-full">

        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-px bg-[#C19A6B]" />
          <span className="text-[#C19A6B] text-xs font-semibold uppercase tracking-[0.25em]">
            {eyebrow}
          </span>
        </div>

        {/* Logo */}
        <h1
          className="text-5xl xl:text-6xl font-bold leading-[1.1] mb-6"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Casa<br />Verde
        </h1>

        {/* Tagline */}
        <p
          className="text-white/75 text-lg xl:text-xl leading-relaxed mb-10 italic"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {tagline}
        </p>

        {/* Items de beneficios / pasos */}
        <div className="space-y-4 mb-12">
          {rightItems}
        </div>

        {/* Separador decorativo */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/15" />
          <Leaf className="w-4 h-4 text-[#C19A6B] opacity-50" />
          <div className="flex-1 h-px bg-white/15" />
        </div>
      </div>
    </div>

  </div>
);

export default AuthLayout;
