import Image from "next/image";
import Link from "next/link";
import tennisImage from "@/assets/tennis-court.jpg"; // Asegúrate de que la ruta sea correcta

const BRAND_GREEN = "#154734";
const BRAND_GOLD  = "#C19A6B";

const ElevaTuLook = () => {
  return (
    <section className="relative py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      
      {/* ── Fondo Decorativo Asimétrico ── */}
      {/* Esto crea un bloque gris muy suave a la derecha para dar contraste */}
      <div className="absolute top-0 right-0 w-full lg:w-1/3 h-full bg-[#FAFAFA] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-0">

          {/* ── IMAGEN EDITORIAL (Izquierda) ── */}
          <div className="w-full lg:w-1/2 relative z-10">
            {/* Contenedor tipo "Marco de Cuadro" con sombra elegante */}
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mr-auto lg:ml-0 bg-white p-3 sm:p-4 shadow-[0_20px_50px_-15px_rgba(21,71,52,0.15)] group">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={tennisImage}
                  alt="Eleva tu look - Casa Verde"
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-[1500ms] ease-[cubic-bezier(0.25,1,0.5,1)]"
                  placeholder="blur"
                />
                {/* Velo oscuro súper sutil para que la imagen se vea más "cinematográfica" */}
                <div className="absolute inset-0 bg-[#154734]/5 mix-blend-multiply pointer-events-none" />
              </div>

              {/* Etiqueta vertical decorativa (estilo revista) */}
              <div className="hidden sm:block absolute -left-5 top-20 bg-[#154734] text-white text-[9px] font-black px-4 py-2 uppercase tracking-[0.2em] shadow-lg -rotate-90 origin-bottom-right pointer-events-none">
                Lookbook
              </div>
            </div>
          </div>

          {/* ── CONTENIDO TEXTO (Derecha, superpuesto) ── */}
          <div className="w-full lg:w-1/2 lg:-ml-16 z-20 flex flex-col items-center text-center lg:items-start lg:text-left">
            {/* En móviles tiene un fondo translúcido, en desktop flota sobre el gris/blanco */}
            <div className="bg-white/80 backdrop-blur-md p-8 sm:p-12 lg:p-0 lg:bg-transparent lg:backdrop-blur-none">

              {/* Detalle superior con línea dorada */}
              <div className="flex items-center gap-3 mb-6 justify-center lg:justify-start">
                <span className="h-px w-8" style={{ background: BRAND_GOLD }} />
                <span className="text-[10px] font-black tracking-[0.38em] uppercase text-[#C19A6B]">
                  Estilo de Vida
                </span>
              </div>

              {/* Título Mixto (Sans-serif + Serif) */}
              <h2 className="text-4xl sm:text-6xl font-light text-[#154734] leading-[1.1] mb-6">
                <span className="block font-bold tracking-[0.15em] text-2xl sm:text-4xl mb-2">ELEVA TU</span>
                <span className="block italic pr-2" style={{ fontFamily: "Georgia, serif", color: BRAND_GOLD }}>
                  Look Diario
                </span>
              </h2>

              {/* Texto descriptivo unificado para mejor lectura */}
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-10 max-w-md mx-auto lg:mx-0">
                Creamos prendas versátiles que te acompañan desde tus entrenamientos más intensos hasta tus momentos de descanso. Combina nuestras piezas y descubre un nivel superior de actitud y comodidad.
              </p>

              {/* Botón de Lujo (El mismo de tu Hero) */}
              <Link
                href="/collections"
                className="group relative inline-flex overflow-hidden px-9 py-4 text-[11px] font-black tracking-[0.32em] uppercase text-white transition-all duration-400 shadow-[0_10px_20px_-10px_rgba(21,71,52,0.4)] hover:shadow-[0_15px_30px_-10px_rgba(193,154,107,0.3)] hover:-translate-y-1"
                style={{ background: BRAND_GREEN }}
              >
                {/* Brillo (Shimmer) dorado al hacer hover */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" style={{ background: "linear-gradient(90deg, transparent 20%, rgba(193,154,107,0.25) 50%, transparent 80%)" }} />
                <span className="absolute inset-0 border border-transparent group-hover:border-[#C19A6B]/50 transition-colors duration-400" />
                <span className="relative">Descubrir Outfits</span>
              </Link>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ElevaTuLook;
