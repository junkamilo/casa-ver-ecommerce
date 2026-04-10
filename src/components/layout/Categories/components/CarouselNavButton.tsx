import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CarouselNavButtonProps } from "../types";

const DIRECTION_STYLES = {
  left: "left-0 -translate-x-4 group-hover/carousel:translate-x-0",
  right: "right-0 translate-x-4 group-hover/carousel:translate-x-0",
} as const;

const DIRECTION_LABELS = {
  left: "Anterior",
  right: "Siguiente",
} as const;

const CarouselNavButton = ({ direction, onClick }: CarouselNavButtonProps) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-100 w-12 h-12 rounded-full bg-white/90 backdrop-blur-md border border-[#154734]/10 items-center justify-center text-[#154734] hover:bg-[#154734] hover:text-white transition-all duration-400 shadow-xl opacity-0 group-hover/carousel:opacity-100 cursor-pointer touch-target active:scale-90 ${DIRECTION_STYLES[direction]}`}
    aria-label={DIRECTION_LABELS[direction]}
  >
    {direction === "left" ? (
      <ChevronLeft className="w-6 h-6 stroke-[1.5]" />
    ) : (
      <ChevronRight className="w-6 h-6 stroke-[1.5]" />
    )}
  </button>
);

export default CarouselNavButton;
