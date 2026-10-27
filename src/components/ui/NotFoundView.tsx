import Link from "next/link";
import { Leaf, ArrowLeft, Search } from "lucide-react";

interface NotFoundViewProps {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export default function NotFoundView({
  title = "Página no encontrada",
  description = "El contenido que buscas no existe o fue removido.",
  backHref = "/tienda",
  backLabel = "Ver todos los productos",
}: NotFoundViewProps) {
  return (
    <main className="flex-1 w-full flex flex-col items-center justify-center px-4 py-24 sm:py-32 bg-[#FAFAFA] selection:bg-[color:var(--theme-accent)]/20">

      {/* Fondo sutil */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(var(--theme-primary) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md mx-auto gap-8">

        {/* Ícono decorativo */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-[color:var(--theme-primary)]/6 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[color:var(--theme-primary)]/10 flex items-center justify-center">
              <Leaf
                className="w-8 h-8 text-[color:var(--theme-primary)]"
                strokeWidth={1.5}
              />
            </div>
          </div>
          {/* Círculo decorativo dorado */}
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-[color:var(--theme-accent)]/40 bg-white" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-[color:var(--theme-accent)]/20" />
        </div>

        {/* Texto */}
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-black uppercase tracking-[0.35em] text-[color:var(--theme-accent)]">
            Casa Verde
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-widest text-[color:var(--theme-primary)] leading-tight">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-gray-500 font-light leading-relaxed">
            {description}
          </p>
        </div>

        {/* Divisor decorativo */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 h-px bg-[color:var(--theme-accent)]/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--theme-accent)]/60" />
          <div className="flex-1 h-px bg-[color:var(--theme-accent)]/30" />
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-3 w-full sm:flex-row sm:max-w-xs">
          <Link
            href={backHref}
            className="flex items-center justify-center gap-2 w-full sm:flex-1 h-12 sm:h-11 px-5 rounded-full bg-[color:var(--theme-primary)] text-[color:var(--theme-primary-fg)] text-xs font-black uppercase tracking-widest sm:tracking-[0.15em] transition-all duration-300 hover:bg-[color:var(--theme-primary)]/90 hover:shadow-[0_8px_25px_-8px_rgba(21,71,52,0.5)] active:scale-95"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            {backLabel}
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:flex-1 h-12 sm:h-11 px-5 rounded-full border border-[color:var(--theme-accent)]/40 text-[color:var(--theme-primary)] text-xs font-black uppercase tracking-widest sm:tracking-[0.15em] transition-all duration-300 hover:border-[color:var(--theme-accent)] hover:bg-[color:var(--theme-accent)]/5 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            Inicio
          </Link>
        </div>

      </div>
    </main>
  );
}
