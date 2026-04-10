import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CarouselButtonProps } from "../types";

export function CarouselButton({ direction, onClick, visible }: CarouselButtonProps) {
  if (!visible) return null;

  const isLeft = direction === "left";

  return (
    <button
      onClick={onClick}
      className={[
        "hidden md:flex absolute top-1/2 -translate-y-1/2 z-50",
        "w-12 h-12 rounded-full bg-white/90 backdrop-blur-md",
        "border border-[#154734]/10 items-center justify-center",
        "text-[#154734] hover:bg-[#154734] hover:text-white",
        "transition-all duration-400 shadow-xl cursor-pointer active:scale-90",
        "opacity-0 group-hover/carousel:opacity-100 group-hover/carousel:translate-x-0",
        isLeft ? "left-0 -translate-x-4" : "right-0 translate-x-4",
      ].join(" ")}
      aria-label={isLeft ? "Anterior" : "Siguiente"}
    >
      {isLeft
        ? <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
        : <ChevronRight className="w-6 h-6 stroke-[1.5]" />
      }
    </button>
  );
}
