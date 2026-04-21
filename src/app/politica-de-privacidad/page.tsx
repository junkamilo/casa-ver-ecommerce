import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad | Casa Verde",
  description:
    "Conoce cómo recolectamos, usamos y protegemos tus datos personales en Casa Verde by Keyla Sánchez.",
};

const sections = [
  {
    number: "1",
    title: "IDENTIFICACIÓN DEL RESPONSABLE DEL TRATAMIENTO",
    items: [
      "Responsable del tratamiento: KEYLA DAYANNA SÁNCHEZ JOYA",
      "NIT: 1095957953",
      "Domicilio: Girón, Santander, Colombia",
      "Correo electrónico: talentocasaverde@gmail.com",
      "Teléfono: 302 245 7432",
    ],
  },
  {
    number: "2",
    title: "MARCO LEGAL",
    items: [
      "Esta política se rige por la legislación colombiana vigente en materia de protección de datos personales, en especial la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas concordantes.",
    ],
  },
  {
    number: "3",
    title: "DATOS PERSONALES QUE SE RECOLECTAN",
    items: [
      "Nombre completo, número de identificación (cédula de ciudadanía), número telefónico, dirección de residencia y envío, correo electrónico e información de pedidos y compras.",
      "De forma automática a través del sitio web: dirección IP, tipo de dispositivo, navegador utilizado, ubicación aproximada y comportamiento de navegación dentro del sitio.",
      "No se almacenan directamente datos financieros sensibles como números de tarjetas de crédito o débito, ya que estos son procesados por plataformas de pago externas seguras.",
    ],
  },
  {
    number: "4",
    title: "FINALIDAD DEL TRATAMIENTO DE LOS DATOS",
    items: [
      "Procesar, confirmar y despachar pedidos; coordinar envíos con empresas transportadoras; contactar al cliente respecto a su compra; brindar servicio al cliente; y llevar control interno de ventas e inventario.",
      "Para fines comerciales y de marketing: envío de promociones, ofertas y novedades; contacto a través de correo electrónico, llamadas telefónicas, WhatsApp y otros canales; publicidad personalizada en plataformas digitales; y análisis de comportamiento para mejorar la experiencia de compra.",
    ],
  },
  {
    number: "5",
    title: "USO DE COOKIES Y TECNOLOGÍAS DE SEGUIMIENTO",
    items: [
      "El sitio web www.casaverdeoficial.com utiliza cookies y tecnologías similares para garantizar el funcionamiento adecuado del sitio, recordar preferencias del usuario, analizar el comportamiento de navegación y realizar campañas publicitarias y remarketing.",
      "Estas tecnologías permiten identificar hábitos de consumo y ofrecer contenido y publicidad personalizada.",
      "El usuario puede configurar su navegador para rechazar el uso de cookies; sin embargo, esto puede afectar el correcto funcionamiento del sitio web.",
    ],
  },
  {
    number: "6",
    title: "AUTORIZACIÓN DEL TITULAR",
    items: [
      "Al proporcionar sus datos personales a través de la página web, redes sociales o canales de venta, el titular autoriza de manera previa, expresa e informada el tratamiento de sus datos conforme a esta política.",
    ],
  },
  {
    number: "7",
    title: "DERECHOS DEL TITULAR",
    items: [
      "Conocer, actualizar y rectificar sus datos personales.",
      "Solicitar prueba de la autorización otorgada.",
      "Ser informado sobre el uso de sus datos.",
      "Revocar la autorización y/o solicitar la supresión de sus datos.",
      "Presentar quejas ante la Superintendencia de Industria y Comercio.",
    ],
  },
  {
    number: "8",
    title: "CANALES PARA EJERCER DERECHOS",
    items: [
      "Para consultas, reclamos o solicitudes relacionadas con datos personales, el titular podrá comunicarse al correo: talentocasaverde@gmail.com",
    ],
  },
  {
    number: "9",
    title: "SEGURIDAD DE LA INFORMACIÓN",
    items: [
      "CASA VERDE BY KEYLA SÁNCHEZ adopta medidas razonables de seguridad para proteger los datos personales contra pérdida, acceso no autorizado, uso indebido o alteración.",
      "Sin embargo, no se puede garantizar seguridad absoluta en internet.",
    ],
  },
  {
    number: "10",
    title: "TRANSFERENCIA Y TRANSMISIÓN DE DATOS",
    items: [
      "Los datos personales podrán ser compartidos con terceros cuando sea necesario para: procesamiento de pagos (pasarelas de pago), envío de productos (transportadoras) y servicios tecnológicos (hosting, plataformas web, herramientas de marketing y analítica).",
      "Estos terceros pueden estar ubicados dentro o fuera de Colombia y están obligados a proteger la información conforme a la ley aplicable.",
    ],
  },
  {
    number: "11",
    title: "ENLACES A TERCEROS",
    items: [
      "El sitio web puede contener enlaces a sitios de terceros. CASA VERDE BY KEYLA SÁNCHEZ no se hace responsable por las prácticas de privacidad de dichos sitios, por lo que se recomienda revisar sus políticas de privacidad.",
    ],
  },
  {
    number: "12",
    title: "MENORES DE EDAD",
    items: [
      "Se permite el tratamiento de datos personales de menores de edad siempre que exista autorización previa de sus padres o representantes legales.",
    ],
  },
  {
    number: "13",
    title: "VIGENCIA DE LA INFORMACIÓN",
    items: [
      "Los datos personales serán conservados durante el tiempo necesario para cumplir las finalidades para las cuales fueron recolectados o según lo exija la ley.",
    ],
  },
  {
    number: "14",
    title: "MODIFICACIONES A LA POLÍTICA",
    items: [
      "CASA VERDE BY KEYLA SÁNCHEZ podrá modificar esta política en cualquier momento. Los cambios serán informados a través del sitio web.",
    ],
  },
  {
    number: "15",
    title: "ACEPTACIÓN",
    items: [
      "El uso de la página web www.casaverdeoficial.com implica la aceptación de esta Política de Privacidad.",
    ],
  },
];

export default function PoliticaDePrivacidadPage() {
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
              <p className="text-[10px] font-black tracking-[0.35em] text-[#C19A6B]/70 uppercase mb-4">
                Casa Verde
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 sm:mb-6">
                Política de Privacidad
              </h1>
              <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Tratamiento y protección de datos personales — Ley 1581 de 2012.
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
                Para ejercer tus derechos o resolver dudas sobre el tratamiento
                de tus datos personales, contáctanos directamente.
              </p>
              <a
                href="mailto:talentocasaverde@gmail.com"
                className="inline-flex items-center justify-center gap-2 text-[#154734] font-semibold text-sm sm:text-base hover:text-[#C19A6B] transition-colors duration-200"
              >
                <span>Correo:</span>
                <span className="font-bold tracking-wide">
                  talentocasaverde@gmail.com
                </span>
              </a>
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
