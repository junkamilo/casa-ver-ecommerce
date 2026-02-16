import Link from "next/link";
import { Instagram, Facebook, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-white border-t-2 border-accent">
      <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* COLUMNA 1: Marca y Eslogan */}
          <div className="flex flex-col items-start">
            <span className="text-3xl font-light tracking-widest text-white mb-6 uppercase" style={{ fontFamily: 'Georgia, serif' }}>
              Casa Verde
            </span>
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-xs">
              Moda consciente y elegante inspirada en la naturaleza. Diseños exclusivos para resaltar tu esencia.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center hover:bg-accent hover:shadow-gold transition-all duration-300 text-white">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center hover:bg-accent hover:shadow-gold transition-all duration-300 text-white">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* COLUMNA 2: Enlaces Rápidos */}
          <div>
            <h4 className="text-sm font-bold tracking-[0.2em] text-accent mb-6 uppercase">
              Explorar
            </h4>
            <ul className="space-y-3">
              <li><Link href="/tienda" className="text-gray-300 text-sm hover:text-white hover:translate-x-1 transition-all inline-block">Tienda</Link></li>
              <li><Link href="/collections/nueva" className="text-gray-300 text-sm hover:text-white hover:translate-x-1 transition-all inline-block">Nueva Colección</Link></li>
              <li><Link href="/collections/mas-vendidos" className="text-gray-300 text-sm hover:text-white hover:translate-x-1 transition-all inline-block">Más Vendidos</Link></li>
              <li><Link href="/nosotros" className="text-gray-300 text-sm hover:text-white hover:translate-x-1 transition-all inline-block">Nuestra Historia</Link></li>
            </ul>
          </div>

          {/* COLUMNA 3: Ayuda */}
          <div>
            <h4 className="text-sm font-bold tracking-[0.2em] text-accent mb-6 uppercase">
              Ayuda
            </h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-gray-300 text-sm hover:text-white hover:translate-x-1 transition-all inline-block">Envíos y Devoluciones</Link></li>
              <li><Link href="#" className="text-gray-300 text-sm hover:text-white hover:translate-x-1 transition-all inline-block">Guía de Tallas</Link></li>
              <li><Link href="#" className="text-gray-300 text-sm hover:text-white hover:translate-x-1 transition-all inline-block">Preguntas Frecuentes</Link></li>
              <li><Link href="#" className="text-gray-300 text-sm hover:text-white hover:translate-x-1 transition-all inline-block">Contacto</Link></li>
            </ul>
          </div>

          {/* COLUMNA 4: Contacto */}
          <div>
            <h4 className="text-sm font-bold tracking-[0.2em] text-accent mb-6 uppercase">
              Contáctanos
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <span>contacto@casaverde.com</span>
              </li>
              <li className="flex items-start gap-3 text-gray-300 text-sm">
                <Phone className="w-5 h-5 text-accent shrink-0" />
                <span>+57 300 123 4567</span>
              </li>
              <li className="text-gray-400 text-xs mt-4">
                Atención Lunes a Viernes<br/>8:00 AM - 6:00 PM
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* BARRA INFERIOR (Copyright) */}
      <div className="border-t border-brand-light bg-brand-dark px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>&copy; 2026 Casa Verde. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Políticas de Privacidad</Link>
            <Link href="#" className="hover:text-white transition-colors">Términos del Servicio</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
