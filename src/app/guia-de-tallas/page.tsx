import Image from "next/image";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guía de Tallas | Casa Verde",
  description:
    "Encuentra tu talla perfecta con nuestra guía de medidas Casa Verde.",
};

export default function GuiaDeTallasPage() {
  return (
    <div className="flex flex-col bg-[#FAFAFA]">
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar />
        <Header />

        <main className="flex-1 w-full">
          {/* Hero */}
          <section className="relative bg-[#154734] text-white overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#C19A6B 1.5px, transparent 1.5px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C19A6B]/50 to-transparent" />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24 text-center">
              <p className="text-[10px] font-black tracking-[0.35em] text-[#C19A6B]/70 uppercase mb-4">
                Casa Verde
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
                Guía de Tallas
              </h1>
              <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Encuentra tu talla ideal con nuestra guía de medidas.
              </p>
            </div>
          </section>

          {/* Content */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
            <div className="flex flex-col gap-8 sm:gap-12">
              <div className="rounded-2xl overflow-hidden border border-[#154734]/10 shadow-sm">
                <Image
                  src="/assets/Tallas.png"
                  alt="Guía de tallas Casa Verde"
                  width={1200}
                  height={900}
                  className="w-full h-auto"
                  priority
                />
              </div>

              <div className="rounded-2xl overflow-hidden border border-[#154734]/10 shadow-sm">
                <Image
                  src="/assets/MedidasTallas.png"
                  alt="Medidas y tallas Casa Verde"
                  width={1200}
                  height={900}
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 sm:mt-16 border border-[#154734]/15 rounded-2xl bg-[#154734]/[0.03] p-6 sm:p-8 text-center flex flex-col gap-3">
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                ¿Tienes dudas sobre tu talla? Con gusto te asesoramos.
              </p>
              <a
                href="https://wa.me/573022457432"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-[#154734] font-semibold text-sm sm:text-base hover:text-[#C19A6B] transition-colors duration-200"
              >
                <span>WhatsApp:</span>
                <span className="font-bold tracking-wide">302 245 74 32</span>
              </a>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}
