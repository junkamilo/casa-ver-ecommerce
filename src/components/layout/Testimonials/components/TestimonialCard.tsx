import { Star } from "lucide-react";
import { TestimonialItem } from "../types/types";

const TestimonialCard = ({ rating, text, name }: TestimonialItem) => (
  <div className="shrink-0 w-64 sm:w-72 md:w-80 border border-border p-5 sm:p-6 lg:p-8 flex flex-col items-center text-center">
    <div
      className="flex gap-0.5 mb-3 sm:mb-4"
      aria-label={`${rating} de 5 estrellas`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
            i < rating ? "fill-foreground text-foreground" : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
    <p className="text-sm text-foreground mb-4 sm:mb-6">{text}</p>
    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted mb-2 sm:mb-3 overflow-hidden">
      <div className="w-full h-full bg-muted-foreground/20 rounded-full" />
    </div>
    <p className="text-sm font-semibold italic text-foreground">{name}</p>
  </div>
);

export default TestimonialCard;
