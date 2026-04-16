import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CarouselButtonProps } from "../types";

export function CarouselButton({ direction, onClick, visible }: CarouselButtonProps) {
  if (!visible) return null;

  const isLeft = direction === "left";

  return (
    <button
      onClick={onClick}
      className={[
        "hidden md:flex absolute top-1/2 -translate-y-1/2 z-20",
        "w-11 h-11 rounded-full bg-white border border-[#154734]/15 shadow-md",
        "items-center justify-center text-[#154734]",
        "hover:bg-[#154734] hover:text-white hover:border-[#154734]",
        "transition-all duration-200 active:scale-90",
        isLeft ? "left-0 opacity-100 -translate-x-5" : "right-0 opacity-100 translate-x-5",
      ].join(" ")}
      aria-label={isLeft ? "Anterior" : "Siguiente"}
    >
      {isLeft
        ? <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
        : <ChevronRight className="w-5 h-5 stroke-[1.5]" />
      }
    </button>
  );
}
