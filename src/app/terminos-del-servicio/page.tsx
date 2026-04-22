import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/ui/BackButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos del Servicio | Casa Verde",
  description:
    "Conoce las condiciones de uso de nuestro sitio web y canales de venta digitales de Casa Verde by Keyla Sánchez.",
};

const sections = [
  {
    number: "1",
    title: "USO DEL SITIO",
    items: [
      "El usuario se compromete a utilizar este sitio web de manera responsable, sin realizar actividades que puedan afectar su funcionamiento o la experiencia de otros usuarios.",
    ],
  },
  {
    number: "2",
    title: "INFORMACIÓN DEL USUARIO",
    items: [
      "El cliente garantiza que la información proporcionada para realizar compras es veraz, completa y actualizada.",
      "CASA VERDE BY KEYLA SÁNCHEZ no se hace responsable por errores en la información suministrada por el cliente.",
    ],
  },
  {
    number: "3",
    title: "DISPONIBILIDAD DE PRODUCTOS",
    items: [
      "La mayoría de nuestras prendas se elaboran bajo confección, por lo que los tiempos de despacho pueden variar.",
      "Nos reservamos el derecho de modificar, suspender o descontinuar productos en cualquier momento.",
    ],
  },
  {
    number: "4",
    title: "PROPIEDAD INTELECTUAL",
    items: [
      "Todo el contenido del sitio web (imágenes, textos, logos, diseños) es propiedad de CASA VERDE BY KEYLA SÁNCHEZ y no puede ser utilizado sin autorización previa.",
    ],
  },
  {
    number: "5",
    title: "ENLACES A TERCEROS",
    items: [
      "Nuestro sitio puede contener enlaces a terceros. No nos responsabilizamos por el contenido ni por las políticas de dichos sitios.",
    ],
  },
  {
    number: "6",
    title: "LIMITACIÓN DE RESPONSABILIDAD",
    items: [
      "CASA VERDE BY KEYLA SÁNCHEZ no será responsable por daños indirectos, incidentales o derivados del uso del sitio web.",
    ],
  },
  {
    number: "7",
    title: "MODIFICACIONES",
    items: [
      "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán publicados en este mismo espacio.",
    ],
  },
  {
    number: "8",
    title: "LEGISLACIÓN APLICABLE",
    items: ["Estos términos se rigen por la legislación colombiana."],
  },
];

export default function TerminosDelServicioPage() {
  return (
    <div className="flex flex-col bg-[#FAFAFA]">
      <div className="min-h-screen flex flex-col">
        <AnnouncementBar />
        <Header />

        <main className="flex-1 w-full">
          {/* ── Hero ── */}
          <section className="relative bg-[#154734] text-white overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(#C19A6B 1.5px, transparent 1.5px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-[#C19A6B]/50 to-transparent" />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24 text-center">
              <div className="absolute top-6 left-4 sm:left-6 md:left-8">
                <BackButton className="text-white/70 hover:text-white" />
              </div>
              <p className="text-[10px] font-black tracking-[0.35em] text-[#C19A6B]/70 uppercase mb-4">
                Casa Verde
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
                Términos del Servicio
              </h1>
              <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Al acceder a nuestro sitio web y canales digitales, aceptas los
                presentes términos.
              </p>
            </div>
          </section>

          {/* ── Content ── */}
          <section className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
            <div className="flex flex-col gap-10 sm:gap-12">
              {sections.map((section) => (
                <div key={section.number} className="flex flex-col gap-4">
                  {/* Section header */}
                  <div className="flex items-center gap-4">
                    <span
                      className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#154734] text-white text-sm font-bold flex items-center justify-center"
                      aria-hidden="true"
                    >
                      {section.number}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold tracking-[0.15em] text-[#154734] uppercase">
                      {section.title}
                    </h2>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-linear-to-r from-[#C19A6B]/40 via-[#C19A6B]/10 to-transparent ml-13" />

                  {/* Items */}
                  <ul className="flex flex-col gap-3 ml-13">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span
                          className="shrink-0 mt-2 w-1.5 h-1.5 rotate-45 bg-[#C19A6B]"
                          aria-hidden="true"
                        />
                        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* ── Contact note ── */}
            <div className="mt-14 sm:mt-16 border border-[#154734]/15 rounded-2xl bg-[#154734]/3 p-6 sm:p-8 text-center flex flex-col gap-3">
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Si tienes preguntas sobre estos términos o necesitas asistencia,
                estamos aquí para ayudarte.
              </p>
              <a
                href="https://wa.me/573022457432"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-[#154734] font-semibold text-sm sm:text-base hover:text-[#C19A6B] transition-colors duration-200"
              >
                <span>Línea de atención:</span>
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
