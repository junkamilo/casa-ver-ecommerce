import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import BackButton from "@/components/ui/BackButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Casa Verde",
  description:
    "Conoce nuestras políticas de compra, envíos, cambios, devoluciones y garantías.",
};

const sections = [
  {
    number: "1",
    title: "PRENDAS",
    items: [
      "Las fotografías y descripciones buscan ser lo más precisas posible; sin embargo, pueden existir ligeras variaciones en color debido a iluminación o configuración de pantalla.",
      "La mayoría de nuestras prendas cuentan con tallaje estándar. Ofrecemos asesoría personalizada a través de WhatsApp 302 245 7432 para ayudarte a elegir la talla ideal.",
    ],
  },
  {
    number: "2",
    title: "MEDIOS DE PAGO",
    items: [
      "Transferencia bancaria: Bancolombia, Nequi, Daviplata o Llave.",
      "Link de pago para tarjeta crédito, débito o PSE.",
      "El pago contra entrega está disponible únicamente en Bucaramanga y su área metropolitana.",
    ],
  },
  {
    number: "3",
    title: "ENVÍOS",
    items: [
      "Los envíos se realizan a nivel nacional mediante transportadoras.",
      "El tiempo de despacho es de 2 a 5 días hábiles una vez confirmada la compra, ya que la mayoría de nuestras prendas se elaboran bajo confección.",
      "El tiempo de entrega dependerá de la ciudad y la transportadora.",
      "No nos hacemos responsables por retrasos ocasionados por terceros, condiciones climáticas o situaciones externas.",
      "El costo del envío es asumido por el cliente, salvo promociones especiales.",
      "Tarifas vigentes: $11.000 para San Gil, Barrancabermeja, Bucaramanga, Girón, Piedecuesta, Floridablanca, Lebrija, Sabana de Torres, Valledupar, Cúcuta y Cantagallo (Bolívar); $30.000 para San Andrés y Providencia; $18.000 para el resto del país.",
    ],
  },
  {
    number: "4",
    title: "CAMBIOS",
    items: [
      "Se aceptan cambios de talla o referencia dentro de los 15 días calendario siguientes a la entrega.",
      "La prenda debe estar sin uso, conservar sus etiquetas y encontrarse en perfecto estado.",
      "El cliente asume los costos de envío, excepto en caso de error por parte de la tienda.",
    ],
  },
  {
    number: "5",
    title: "DEVOLUCIONES Y REEMBOLSOS",
    items: [
      "Solo se realizan devoluciones en caso de productos defectuosos o errores en el envío.",
      "El reembolso se realizará en un tiempo razonable, a través del mismo medio de pago o como saldo a favor.",
      "No se realizan devoluciones por motivos de gusto, talla, arrepentimiento de compra, retrasos ajenos a la tienda o falta de recepción del pedido.",
    ],
  },
  {
    number: "6",
    title: "GARANTÍA",
    items: [
      "Aplica únicamente por defectos de fabricación.",
      "No cubre daños por uso indebido, lavado incorrecto, desgaste normal o accidentes.",
    ],
  },
  {
    number: "7",
    title: "RETRASOS EN LA ENTREGA",
    items: [
      "Si el pedido fue despachado dentro del tiempo establecido pero la transportadora presenta retrasos, no aplican devoluciones.",
      "En estos casos se podrá: reprogramar la entrega, enviar a otra dirección o esperar el retorno del paquete para reenviarlo.",
    ],
  },
  {
    number: "8",
    title: "PAQUETES DEVUELTOS",
    items: [
      "Si el pedido es devuelto por la transportadora debido a dirección incorrecta, ausencia del destinatario o no reclamación, el cliente deberá asumir el costo de un nuevo envío.",
    ],
  },
  {
    number: "9",
    title: "DERECHO DE RETRACTO",
    items: [
      "De acuerdo con la Ley 1480 de 2011, el cliente podrá ejercer el derecho de retracto dentro de los cinco (5) días hábiles siguientes a la entrega del producto.",
      "La prenda debe estar sin uso, en perfectas condiciones y con etiquetas.",
      "El cliente deberá asumir los costos de devolución.",
    ],
  },
  {
    number: "10",
    title: "CONTACTO",
    items: [
      "Para solicitudes de cambios, devoluciones, garantías o cualquier inquietud relacionada con tu pedido, comunícate con nosotros a través de nuestro canal oficial de atención.",
      "Nuestro equipo estará disponible para brindarte acompañamiento durante todo el proceso.",
    ],
  },
];

export default function TerminosYCondicionesPage() {
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
                Términos y Condiciones
              </h1>
              <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Al realizar una compra, declaras haber leído y aceptado estas
                condiciones.
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

            {/* ── Commitment note ── */}
            <div className="mt-14 sm:mt-16 border border-[#154734]/15 rounded-2xl bg-[#154734]/3 p-6 sm:p-8 text-center flex flex-col gap-3">
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                Nuestro compromiso siempre será cumplir con los tiempos de
                despacho, acompañarte en el proceso y ayudarte con cualquier
                inconveniente.
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
