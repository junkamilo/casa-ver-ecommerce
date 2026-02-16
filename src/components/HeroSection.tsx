import Image from "next/image";
import heroImage from "@/assets/hero-models.jpg";

const HeroSection = () => {
  // Colores de la marca para mantener consistencia
  const BRAND_GREEN = "bg-[#154734]";
  const ARROW_COLOR = "border-l-[#154734]";
  
  return (
    <section className="w-full bg-white relative">
      {/* Contenedor de la Imagen Principal 
         Hicimos la altura responsive para que se vea bien en celulares y pantallas grandes
      */}
      <div className="w-full relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh]">
        <Image
          src={heroImage}
          alt="Casa Verde - Nueva Colección"
          fill
          className="object-cover object-top"
          priority
          placeholder="blur"
        />
        
        {/* Overlay opcional para que el texto resalte si decides ponerlo encima */}
        <div className="absolute inset-0 bg-black/5" />
      </div>

      {/* Barra de Controles (Dots)
         Diseño minimalista usando los colores de la paleta
      */}
      <div className="flex items-center justify-center gap-4 py-4 bg-white border-b border-gray-100">
        
        {/* Botón "Play" o "Siguiente" estilo flecha */}
        <button 
          className={`w-0 h-0 border-l-[8px] ${ARROW_COLOR} border-y-[6px] border-y-transparent hover:border-l-[#C19A6B] transition-colors duration-300 cursor-pointer`} 
          aria-label="Siguiente imagen"
        />
        
        {/* Dot Activo (Verde Marca) */}
        <button 
          className={`w-3 h-3 rounded-full ${BRAND_GREEN} ring-2 ring-offset-2 ring-transparent`} 
          aria-label="Slide 1 actual"
        />
        
        {/* Dot Inactivo (Gris suave -> Dorado al hover) */}
        <button 
          className="w-3 h-3 rounded-full bg-gray-300 hover:bg-[#C19A6B] transition-colors duration-300" 
          aria-label="Ir al Slide 2"
        />
      </div>
    </section>
  );
};

export default HeroSection;
