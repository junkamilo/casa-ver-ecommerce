import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
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
      "Las fotografías y descripciones buscan ser lo más precisas posible, sin embargo, pueden existir variaciones mínimas en color debido a la iluminación o pantallas.",
      "La mayoría de nuestras prendas cuentan con tallaje estándar. Sin embargo, te ofrecemos asesoría personalizada para ayudarte a elegir la talla ideal a través de nuestro WhatsApp 302 245 7432.",
    ],
  },
  {
    number: "2",
    title: "MEDIOS DE PAGOS",
    items: [
      "Puedes realizar tu pago mediante transferencia a Bancolombia, Nequi, Llave o Daviplata, o solicitar nuestro link de pago para tarjetas crédito, débito o PSE.",
      "El servicio de pago contrarreembolso está disponible únicamente en Bucaramanga y su área metropolitana.",
    ],
  },
  {
    number: "3",
    title: "ENVÍOS",
    items: [
      "Los envíos se realizan a través de transportadoras nacionales.",
      "Los tiempos de entrega pueden variar según la ciudad y la empresa transportadora.",
      "No nos hacemos responsables por retrasos originados por terceros, situaciones climáticas o eventos fuera de nuestro control.",
      "El costo del envío es asumido por el cliente, salvo promociones específicas.",
    ],
  },
  {
    number: "4",
    title: "CAMBIOS",
    items: [
      "Se aceptan cambios de talla o referencia dentro de los 15 días calendario siguientes a la entrega.",
      "El producto debe estar: En perfecto estado, sin uso y con etiqueta.",
      "El cliente asume los costos de envío para realizar cambios, excepto por errores de la tienda.",
    ],
  },
  {
    number: "5",
    title: "DEVOLUCIONES Y REEMBOLSO",
    items: [
      "Solo se realizan devoluciones por productos defectuosos o por errores de envío.",
      "Una vez aprobado el reembolso, se hará en un plazo razonable en el mismo medio de pago utilizado o como saldo a favor.",
      "No se realizan devoluciones por: Motivos de gusto, talla o arrepentimiento de compra, retrasos ajenos a la tienda, falta de recepción por parte del cliente o ausencia en la dirección.",
    ],
  },
  {
    number: "6",
    title: "GARANTÍA",
    items: [
      "La garantía aplica únicamente por defectos de fábrica.",
      "No cubre daños por mal uso, lavado inadecuado, desgaste normal o accidentes.",
    ],
  },
  {
    number: "7",
    title: "RETRASOS EN LA ENTREGA",
    items: [
      "Si el pedido fue enviado dentro de los tiempos establecidos, pero la transportadora presenta retrasos, no aplican devoluciones de dinero. En estos casos, podemos: Esperar el retorno del paquete para reenviarlo, reprogramar la entrega o enviar el pedido a otra persona o dirección previamente indicada por el cliente.",
    ],
  },
  {
    number: "8",
    title: "PAQUETES DEVUELTOS POR LA TRANSPORTADORA",
    items: [
      "Si la transportadora retorna el paquete por: Dirección incorrecta, ausencia del destinatario, o no reclamación, el cliente deberá asumir el nuevo costo de envío para reprogramar la entrega.",
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
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C19A6B]/50 to-transparent" />

            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24 text-center">
              <p className="text-[10px] font-black tracking-[0.35em] text-[#C19A6B]/70 uppercase mb-4">
                Casa Verde
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
                Términos y Condiciones
              </h1>
              <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Al realizar una compra, aceptas plenamente estas políticas.
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
                      className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#154734] text-white text-sm font-bold flex items-center justify-center"
                      aria-hidden="true"
                    >
                      {section.number}
                    </span>
                    <h2 className="text-base sm:text-lg font-bold tracking-[0.15em] text-[#154734] uppercase">
                      {section.title}
                    </h2>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-[#C19A6B]/40 via-[#C19A6B]/10 to-transparent ml-13" />

                  {/* Items */}
                  <ul className="flex flex-col gap-3 ml-13">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span
                          className="flex-shrink-0 mt-2 w-1.5 h-1.5 rotate-45 bg-[#C19A6B]"
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
            <div className="mt-14 sm:mt-16 border border-[#154734]/15 rounded-2xl bg-[#154734]/[0.03] p-6 sm:p-8 text-center flex flex-col gap-3">
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
