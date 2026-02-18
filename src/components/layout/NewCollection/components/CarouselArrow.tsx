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
      className={`absolute ${isLeft ? "left-0 -ml-2 sm:-ml-3" : "right-0 -mr-2 sm:-mr-3"} top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-background/90 border border-border rounded-full flex items-center justify-center shadow-md hover:bg-background transition-colors`}
      aria-label={isLeft ? "Anterior" : "Siguiente"}
    >
      {isLeft ? (
        <ChevronLeft className="w-5 h-5 text-foreground" />
      ) : (
        <ChevronRight className="w-5 h-5 text-foreground" />
      )}
    </button>
  );
};

export default CarouselArrow;
