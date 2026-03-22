import Image from "next/image";
import Link from "next/link";
import { Leaf, ArrowLeft, Lock, ShieldCheck, KeyRound } from "lucide-react";
import ForgotPasswordForm from "@/components/forgot-password";

export default function RecuperarPage() {
  return (
    <div className="flex flex-col lg:flex-row lg:h-dvh">

      {/* ────────────── PANEL IZQUIERDO ────────────── */}
      <div className="w-full lg:w-[55%] bg-white flex flex-col lg:h-dvh">

        {/* Top bar */}
        <div className="shrink-0 flex items-center justify-between px-6 sm:px-10 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#154734]" />
            <span
              className="text-xl font-bold text-[#154734]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Casa Verde
            </span>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#154734] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio de sesión
          </Link>
        </div>

        {/* Área del formulario */}
        <div className="flex-1 overflow-y-auto scrollbar-brand px-6 sm:px-10 py-8 flex flex-col items-center justify-center">
          <ForgotPasswordForm />
        </div>
      </div>

      {/* ────────────── PANEL DERECHO (desktop) ────────────── */}
      <div className="hidden lg:flex lg:sticky lg:top-0 lg:w-[45%] lg:h-dvh relative overflow-hidden">

        {/* Foto de fondo */}
        <Image
          src="/heroImage2.jpg"
          alt="Colección Casa Verde"
          fill
          className="object-cover"
          priority
        />

        {/* Gradiente overlay */}
        <div className="absolute inset-0 bg-linear-to-br from-[#154734]/88 via-[#154734]/72 to-[#0a2218]/92" />

        {/* Hojas decorativas de fondo */}
        <div className="absolute -bottom-20 -right-20 opacity-[0.07] pointer-events-none">
          <Leaf className="w-80 h-80 text-white" />
        </div>
        <div className="absolute -top-10 -left-10 rotate-200 opacity-[0.07] pointer-events-none">
          <Leaf className="w-56 h-56 text-white" />
        </div>

        {/* Contenido del panel */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 py-12 text-white h-full">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-px bg-[#C19A6B]" />
            <span className="text-[#C19A6B] text-xs font-semibold uppercase tracking-[0.25em]">
              Seguridad en
            </span>
          </div>

          {/* Logo grande */}
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
            "Tu cuenta protegida,<br />siempre a tu alcance"
          </p>

          {/* Pasos del proceso */}
          <div className="space-y-4 mb-12">
            {[
              { icon: KeyRound,    text: "Ingresa tu correo de recuperación" },
              { icon: ShieldCheck, text: "Verifica el código que recibirás" },
              { icon: Lock,        text: "Crea tu nueva contraseña segura" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={text} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-[#C19A6B]/25 border border-[#C19A6B]/55 flex items-center justify-center shrink-0">
                  <Icon className="w-3 h-3 text-[#C19A6B]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#C19A6B] text-xs font-bold">{i + 1}.</span>
                  <span className="text-white/80 text-sm leading-snug">{text}</span>
                </div>
              </div>
            ))}
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
}
