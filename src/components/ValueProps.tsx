import { Crown, Leaf, RefreshCw } from "lucide-react";

const props = [
  {
    icon: Crown,
    title: "DISEÑOS EXCLUSIVOS",
    subtitle: "Everything we do starts with why",
  },
  {
    icon: Leaf,
    title: "COMODIDAD ABSOLUTA",
    subtitle: "We believe in building better",
  },
  {
    icon: RefreshCw,
    title: "PARA TODA OCASIÓN",
    subtitle: "Real people making great products",
  },
];

const ValueProps = () => {
  return (
    <section className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
        {props.map((prop, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <prop.icon className="w-7 h-7 sm:w-8 sm:h-8 text-brand mb-3 sm:mb-4" strokeWidth={1.5} />
            <h3 className="text-xs sm:text-sm font-bold tracking-wider text-foreground mb-1 sm:mb-2">{prop.title}</h3>
            <p className="text-xs text-muted-foreground">{prop.subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ValueProps;
