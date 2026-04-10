import Image from "next/image";
import { SLIDES } from "../constants";
import type { SlideTrackProps } from "../types";

export function SlideTrack({ currentSlide }: SlideTrackProps) {
  return (
    <div
      className="absolute inset-0 flex transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]"
      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
    >
      {SLIDES.map((slide, index) => (
        <div key={slide.id} className="relative w-full h-full shrink-0">
          <Image
            src={slide.image}
            alt={`Casa Verde — ${slide.id}`}
            fill
            className="object-cover object-center md:object-top"
            priority={index === 0}
          />
        </div>
      ))}
    </div>
  );
}
