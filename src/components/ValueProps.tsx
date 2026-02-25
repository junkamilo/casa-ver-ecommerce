import { Crown, Leaf, RefreshCw } from "lucide-react";

// Textos mejorados para transmitir lujo, calidad y versatilidad
const props = [
  {
    icon: Crown,
    title: "Diseños Exclusivos",
    subtitle: "Siluetas únicas diseñadas para resaltar tu figura y elevar tu confianza en cada paso.",
  },
  {
    icon: Leaf,
    title: "Comodidad Absoluta",
    subtitle: "Tejidos premium y transpirables que se adaptan a ti como una segunda piel.",
  },
  {
    icon: RefreshCw,
    title: "Para Toda Ocasión",
    subtitle: "Versatilidad impecable: desde un entrenamiento intenso hasta un look casual de fin de semana.",
  },
];

const ValueProps = () => {
  return (
    // 1. Cambiamos el fondo general a un tono más crema/gris claro para que las tarjetas resalten
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA] border-y border-[#C19A6B]/10">
      
      {/* ── GRID CON TARJETAS SEPARADAS ── */}
      {/* Quitamos los divide-x porque ahora cada uno será una tarjeta independiente (gap-6) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        
        {props.map((prop, i) => {
          const Icon = prop.icon;
          
          return (
            <div 
              key={i} 
              // 2. Aquí creamos la "Tarjeta": fondo blanco, borde tenue y sombra sutil
              className="group flex flex-col items-center text-center px-6 sm:px-10 py-12 bg-white border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_-5px_rgba(21,71,52,0.08)] hover:-translate-y-1.5 transition-all duration-500 cursor-default"
            >
              
              {/* Contenedor del Icono Interactivo */}
              <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#FAFAFA] border border-[#C19A6B]/20 mb-6 group-hover:bg-[#154734] group-hover:border-[#154734] group-hover:shadow-md transition-all duration-500">
                <Icon 
                  className="w-6 h-6 text-[#154734] group-hover:text-[#C19A6B] transition-colors duration-500" 
                  strokeWidth={1.5} 
                />
              </div>
              
              {/* Título */}
              <h3 className="text-[11px] font-black tracking-[0.25em] text-[#154734] uppercase mb-3">
                {prop.title}
              </h3>
              
              {/* Separador Animado */}
              <div className="h-px w-6 bg-[#C19A6B]/40 mb-4 group-hover:w-12 transition-all duration-500" />
              
              {/* Subtítulo */}
              <p className="text-sm text-gray-500 leading-relaxed">
                {prop.subtitle}
              </p>
              
            </div>
          );
        })}

      </div>
    </section>
  );
};

export default ValueProps;
