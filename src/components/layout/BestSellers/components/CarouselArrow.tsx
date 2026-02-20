import { ChevronLeft, ChevronRight } from "lucide-react";

interface CarouselArrowProps {
  direction: "left" | "right";
  onClick: () => void;
}

const CarouselArrow = ({ direction, onClick }: CarouselArrowProps) => {
  const isLeft = direction === "left";
  
  return (
    <button
      onClick={onClick}
      className={`absolute ${
        isLeft ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
      } top-[40%] -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/80 backdrop-blur-md border border-[#154734]/10 flex items-center justify-center text-[#154734] hover:bg-[#154734] hover:text-white transition-all duration-400 shadow-[0_8px_30px_rgb(0,0,0,0.08)] opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0 cursor-pointer`}
      aria-label={isLeft ? "Anterior" : "Siguiente"}
    >
      {isLeft ? (
        <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
      ) : (
        <ChevronRight className="w-5 h-5 stroke-[1.5]" />
      )}
    </button>
  );
};

export default CarouselArrow;