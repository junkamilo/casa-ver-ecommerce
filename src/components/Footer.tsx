import Link from "next/link";
import { Mail, Phone } from "lucide-react";

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-[#154734] text-white relative overflow-hidden isolate">

      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{ backgroundImage: "radial-gradient(#C19A6B 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }}
      />

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C19A6B] to-transparent opacity-50" />

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 relative z-10">
        <div className="max-w-7xl 2xl:max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 md:gap-12 lg:gap-8">

            <div className="sm:col-span-2 lg:col-span-5">
              <h4 className="text-[9px] sm:text-[10px] font-black tracking-[0.25em] text-white/50 mb-3 uppercase">
                Newsletter
              </h4>
              <p className="text-white/70 text-sm mb-5 leading-relaxed">
                Recibe novedades, lanzamientos y descuentos exclusivos directo en tu correo.
              </p>
              <form className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="flex-1 min-w-0 bg-white/5 border border-white/20 text-white placeholder:text-gray-400 text-sm px-4 py-3 rounded-full focus:outline-none focus:border-[#C19A6B] focus:bg-white/10 transition-all duration-300"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-[#C19A6B] hover:bg-white hover:text-[#154734] text-white font-semibold text-sm px-5 py-3 rounded-full transition-colors duration-300 whitespace-nowrap h-10 active:scale-95 touch-target"
                >
                  Suscribirse
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 lg:col-start-7">
              <h4 className="text-[9px] sm:text-[10px] font-black tracking-[0.25em] text-white/50 mb-4 sm:mb-6 uppercase">
                Explorar
              </h4>
              <ul className="space-y-3 sm:space-y-4">
                {[
                  { name: "Tienda", href: "/tienda" },
                  { name: "Nueva Colección", href: "/collections/nueva" },
                  { name: "Más Vendidos", href: "/collections/mas-vendidos" },
                  { name: "Nuestra Historia", href: "/nosotros" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-300 text-sm hover:text-[#C19A6B] transition-all flex items-center gap-2 group w-fit p-1 touch-target active:scale-95">
                      <span className="w-0 h-[1px] bg-[#C19A6B] transition-all duration-300 group-hover:w-4" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-[9px] sm:text-[10px] font-black tracking-[0.25em] text-white/50 mb-4 sm:mb-6 uppercase">
                Ayuda
              </h4>
              <ul className="space-y-3 sm:space-y-4">
                {[
                  { name: "Envíos y Devoluciones", href: "#" },
                  { name: "Guía de Tallas", href: "#" },
                  { name: "Preguntas Frecuentes", href: "#" },
                  { name: "Contacto", href: "#" }
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-300 text-sm hover:text-[#C19A6B] transition-all flex items-center gap-2 group w-fit p-1 touch-target active:scale-95">
                      <span className="w-0 h-[1px] bg-[#C19A6B] transition-all duration-300 group-hover:w-4" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <h4 className="text-[9px] sm:text-[10px] font-black tracking-[0.25em] text-white/50 mb-4 sm:mb-6 uppercase">
                Contacto
              </h4>
              <ul className="space-y-4 sm:space-y-5">
                <li>
                  <a href="mailto:contacto@casaverde.com" className="flex items-start gap-3 text-gray-300 text-sm hover:text-white transition-colors group p-1 touch-target active:scale-95">
                    <Mail className="w-4 h-4 text-[#C19A6B] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span>contacto@casaverde.com</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+573001234567" className="flex items-start gap-3 text-gray-300 text-sm hover:text-white transition-colors group p-1 touch-target active:scale-95">
                    <Phone className="w-4 h-4 text-[#C19A6B] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <span>+57 300 123 4567</span>
                  </a>
                </li>
              </ul>

              <div className="flex items-center gap-3 mt-6">
                <a
                  href="https://wa.me/573001234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-300 hover:text-white hover:border-[#C19A6B] hover:bg-[#C19A6B]/10 transition-all duration-300 touch-target active:scale-90"
                >
                  <WhatsAppIcon />
                </a>
                <a
                  href="https://instagram.com/casaverde"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-300 hover:text-white hover:border-[#C19A6B] hover:bg-[#C19A6B]/10 transition-all duration-300 touch-target active:scale-90"
                >
                  <InstagramIcon />
                </a>
                <a
                  href="mailto:contacto@casaverde.com"
                  aria-label="Correo electrónico"
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-gray-300 hover:text-white hover:border-[#C19A6B] hover:bg-[#C19A6B]/10 transition-all duration-300 touch-target active:scale-90"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6">
          <div className="max-w-7xl 2xl:max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs text-white/50 font-light tracking-wide text-center sm:text-left">
              &copy; {new Date().getFullYear()} Casa Verde. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6 text-xs text-white/50 font-light tracking-wide justify-center sm:justify-end">
              <Link href="#" className="hover:text-[#C19A6B] transition-colors p-1 touch-target active:scale-95">Políticas de Privacidad</Link>
              <Link href="#" className="hover:text-[#C19A6B] transition-colors p-1 touch-target active:scale-95">Términos del Servicio</Link>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;