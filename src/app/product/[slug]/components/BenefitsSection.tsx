"use client";

import { Crown, Feather, Clock, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const benefits = [
  {
    icon: Crown,
    title: "Diseño Exclusivo",
    description:
      "Siluetas únicas y atemporales creadas con precisión para destacar tu esencia y estilo personal.",
  },
  {
    icon: Feather,
    title: "Comodidad Absoluta",
    description:
      "Tejidos premium y transpirables que se adaptan a tu cuerpo, sintiéndose como una segunda piel.",
  },
  {
    icon: Clock,
    title: "Versatilidad",
    description:
      "Prendas pensadas para acompañarte y fluir sin esfuerzo desde el día hasta la noche.",
  },
];

export default function BenefitsSection() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mt-20 sm:mt-32 border-y border-[#C19A6B]/20 bg-[#F9F7F4] relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-[#C19A6B]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 sm:py-24 relative z-10">

        <div className="flex items-center justify-center mb-12 sm:mb-16 gap-3">
          <span className="h-px w-8 bg-[#C19A6B]/50" />
          <span className="text-xs font-black tracking-[0.4em] uppercase text-[#C19A6B] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            La Experiencia Casa Verde
          </span>
          <span className="h-px w-8 bg-[#C19A6B]/50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 md:divide-x divide-[#C19A6B]/20">
          {benefits.map(({ icon: Icon, title, description }, index) => (
            <div
              key={title}
              style={{ transitionDelay: `${index * 150}ms` }}
              className={`flex flex-col items-center text-center px-4 sm:px-8 xl:px-12 group transition-all duration-700 ${
                visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
              }`}
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-[#C19A6B]/30 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 group-hover:bg-[#154734] group-hover:border-[#154734] group-hover:shadow-lg transition-all duration-500">
                <Icon
                  className="w-7 h-7 sm:w-8 sm:h-8 text-[#C19A6B] group-hover:text-white transition-colors duration-500 relative z-10"
                  strokeWidth={1.5}
                />
                <Sparkles className="absolute w-5 h-5 text-[#C19A6B]/30 scale-150 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 animate-pulse" />
              </div>

              <h3
                className="text-lg sm:text-xl text-[#154734] mb-3"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {title}
              </h3>

              <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed max-w-xs">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
