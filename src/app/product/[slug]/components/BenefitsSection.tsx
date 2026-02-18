import { Crown, Feather, Clock } from "lucide-react";

const benefits = [
  {
    icon: Crown,
    title: "Diseños Exclusivos",
    description: "Everything we do starts with why",
  },
  {
    icon: Feather,
    title: "Comodidad Absoluta",
    description: "We believe in building better",
  },
  {
    icon: Clock,
    title: "Para toda ocasión",
    description: "Real people making great products",
  },
];

export default function BenefitsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center py-10 sm:py-16 border-t border-border mt-10 sm:mt-16">
      {benefits.map(({ icon: Icon, title, description }) => (
        <div key={title} className="flex flex-col items-center">
          <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-[#c19a6b] mb-2 sm:mb-3" />
          <h3 className="font-bold text-xs sm:text-sm uppercase mb-1">{title}</h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground">{description}</p>
        </div>
      ))}
    </div>
  );
}
