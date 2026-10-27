import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CarouselNavButtonProps } from "../types";

const DIRECTION_STYLES = {
  left: "left-0 -translate-x-5",
  right: "right-0 translate-x-5",
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
    className={`hidden md:flex absolute top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white border border-[color:var(--theme-primary)]/15 shadow-md items-center justify-center text-[color:var(--theme-primary)] hover:bg-[color:var(--theme-primary)] hover:text-[color:var(--theme-primary-fg)] hover:border-[color:var(--theme-primary)] transition-all duration-200 active:scale-90 ${DIRECTION_STYLES[direction]}`}
    aria-label={DIRECTION_LABELS[direction]}
  >
    {direction === "left" ? (
      <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
    ) : (
      <ChevronRight className="w-5 h-5 stroke-[1.5]" />
    )}
  </button>
);

export default CarouselNavButton;
