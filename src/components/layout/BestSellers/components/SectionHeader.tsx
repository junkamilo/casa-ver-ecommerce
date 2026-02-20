import Link from "next/link";

const BRAND_GOLD  = "#C19A6B";
const BRAND_GREEN = "#154734";

const SectionHeader = () => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 w-full">
    <div>
      {/* Etiqueta superior con línea */}
      <div className="flex items-center gap-3 mb-3">
        <span className="h-px w-8" style={{ background: BRAND_GOLD }} />
        <span className="text-[10px] font-black tracking-[0.38em] uppercase text-[#C19A6B]">
          Descubre
        </span>
      </div>
      
      {/* Titular Editorial */}
      <h2 
        className="text-4xl sm:text-5xl font-light text-[#154734] leading-none" 
        style={{ fontFamily: "Georgia, serif" }}
      >
        Los Más <span className="italic" style={{ color: BRAND_GOLD }}>Deseados</span>
      </h2>
    </div>

    {/* Enlace "Ver todo" al estilo del Hero */}
    <Link
      href="/collections/mas-vendidos"
      className="group flex items-center gap-2.5 text-[11px] font-black tracking-[0.32em] uppercase text-[#154734] hover:text-[#C19A6B] transition-colors duration-300 pb-2"
    >
      VER COLECCIÓN
      <span className="h-px w-5 bg-[#154734]/30 group-hover:w-9 group-hover:bg-[#C19A6B] transition-all duration-350 ease-out" />
    </Link>
  </div>
);

export default SectionHeader;
