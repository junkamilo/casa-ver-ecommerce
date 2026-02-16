import { Star } from "lucide-react";

const testimonials = [
  {
    rating: 5,
    text: "Son muy tesas 👏",
    name: "Alejandra Chalarca",
  },
  {
    rating: 5,
    text: "Amo a amatto 😍 😍",
    name: "Vanessa M",
  },
  {
    rating: 5,
    text: "Es perfecta la horma, la calidad se siente, las prendas son demasiado cómodas",
    name: "Laura Villa",
  },
];

const Testimonials = () => {
  return (
    <section className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="border border-border p-5 sm:p-6 lg:p-8 flex flex-col items-center text-center">
            <div className="flex gap-0.5 mb-3 sm:mb-4">
              {Array.from({ length: 5 }).map((_, si) => (
                <Star
                  key={si}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${si < t.rating ? "fill-foreground text-foreground" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <p className="text-sm text-foreground mb-4 sm:mb-6">{t.text}</p>
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted mb-2 sm:mb-3 overflow-hidden">
              <div className="w-full h-full bg-muted-foreground/20 rounded-full" />
            </div>
            <p className="text-sm font-semibold italic text-foreground">{t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
