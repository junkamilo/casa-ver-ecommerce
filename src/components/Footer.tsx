import Link from "next/link";
import { Instagram, Facebook, Mail, Phone, ArrowRight, Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#154734] text-white relative overflow-hidden isolate">
      
      {/* Patrón de fondo sutil */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" 
        style={{ backgroundImage: "radial-gradient(#C19A6B 1.5px, transparent 1.5px)", backgroundSize: "32px 32px" }} 
      />
      
      {/* Acento decorativo superior */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C19A6B] to-transparent opacity-50" />

      {/* SECCIÓN NEWSLETTER (Innovación) */}
      <div className="border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md text-center md:text-left">
            <h3 className="text-xl sm:text-2xl mb-2 flex items-center justify-center md:justify-start gap-2" style={{ fontFamily: 'Georgia, serif' }}>
              <Sparkles className="w-5 h-5 text-[#C19A6B]" />
              Únete al club Casa Verde
            </h3>
            <p className="text-sm text-gray-300 font-light">
              Suscríbete para recibir acceso anticipado a nuevas colecciones, eventos exclusivos y sorpresas.
            </p>
          </div>
          <div className="w-full md:w-auto flex-1 max-w-md">
            <form className="flex relative group">
              <input 
                type="email" 
                placeholder="Tu correo electrónico" 
                className="w-full bg-white/5 border border-white/20 text-white placeholder:text-gray-400 text-sm px-6 py-4 rounded-full focus:outline-none focus:border-[#C19A6B] focus:bg-white/10 transition-all duration-300"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#C19A6B] rounded-full flex items-center justify-center hover:bg-white hover:text-[#154734] transition-colors duration-300"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* COLUMNA 1: Marca y Eslogan (Toma más espacio) */}
          <div className="lg:col-span-4 flex flex-col items-start">
            <Link href="/" className="text-3xl sm:text-4xl tracking-tight leading-none mb-6 group" style={{ fontFamily: 'Georgia, serif' }}>
              CASA <span className="italic text-[#C19A6B] group-hover:text-white transition-colors duration-500">VERDE</span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-8 max-w-sm font-light">
              Moda consciente y elegante inspirada en la naturaleza. Diseños exclusivos creados para resaltar tu esencia con cada detalle.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#C19A6B] hover:border-[#C19A6B] transition-all duration-300 text-white group">
                <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#C19A6B] hover:border-[#C19A6B] transition-all duration-300 text-white group">
                <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
          </div>

          {/* COLUMNA 2: Enlaces Rápidos */}
          <div className="lg:col-span-3 lg:col-start-6">
            <h4 className="text-[10px] font-black tracking-[0.25em] text-white/50 mb-6 uppercase">
              Explorar
            </h4>
            <ul className="space-y-4">
              {[
                { name: "Tienda", href: "/tienda" },
                { name: "Nueva Colección", href: "/collections/nueva" },
                { name: "Más Vendidos", href: "/collections/mas-vendidos" },
                { name: "Nuestra Historia", href: "/nosotros" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 text-sm hover:text-[#C19A6B] transition-all flex items-center gap-2 group w-fit">
                    <span className="w-0 h-[1px] bg-[#C19A6B] transition-all duration-300 group-hover:w-4" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNA 3: Ayuda */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black tracking-[0.25em] text-white/50 mb-6 uppercase">
              Ayuda
            </h4>
            <ul className="space-y-4">
              {[
                { name: "Envíos y Devoluciones", href: "#" },
                { name: "Guía de Tallas", href: "#" },
                { name: "Preguntas Frecuentes", href: "#" },
                { name: "Contacto", href: "#" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-300 text-sm hover:text-[#C19A6B] transition-all flex items-center gap-2 group w-fit">
                    <span className="w-0 h-[1px] bg-[#C19A6B] transition-all duration-300 group-hover:w-4" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNA 4: Contacto */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black tracking-[0.25em] text-white/50 mb-6 uppercase">
              Contacto
            </h4>
            <ul className="space-y-5">
              <li>
                <a href="mailto:contacto@casaverde.com" className="flex items-start gap-3 text-gray-300 text-sm hover:text-white transition-colors group">
                  <Mail className="w-4 h-4 text-[#C19A6B] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>contacto@casaverde.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+573001234567" className="flex items-start gap-3 text-gray-300 text-sm hover:text-white transition-colors group">
                  <Phone className="w-4 h-4 text-[#C19A6B] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>+57 300 123 4567</span>
                </a>
              </li>
              <li className="text-white/40 text-xs mt-6 font-light uppercase tracking-wider leading-relaxed">
                Lunes a Viernes<br/>
                <span className="text-white/60 font-medium">8:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* BARRA INFERIOR (Copyright) */}
      <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50 font-light tracking-wide">
            &copy; {new Date().getFullYear()} Casa Verde. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-xs text-white/50 font-light tracking-wide">
            <Link href="#" className="hover:text-[#C19A6B] transition-colors">Políticas de Privacidad</Link>
            <Link href="#" className="hover:text-[#C19A6B] transition-colors">Términos del Servicio</Link>
          </div>
        </div>
      </div>
      
    </footer>
  );
};

export default Footer;