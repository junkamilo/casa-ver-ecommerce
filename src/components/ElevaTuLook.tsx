import Image from "next/image";
import tennisImage from "@/assets/tennis-court.jpg";

const ElevaTuLook = () => {
  return (
    <section className="py-10 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 lg:gap-16">
        <div className="w-full md:flex-1 shadow-premium-hover">
          <Image
            src={tennisImage}
            alt="Eleva tu look - Amatto Sport"
            className="w-full aspect-[4/5] object-cover"
            placeholder="blur"
          />
        </div>
        <div className="w-full md:flex-1 text-center">
          <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-primary mb-3 sm:mb-4">ELEVA TU LOOK</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            Creamos prendas versátiles para tus
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-1">
            entrenamientos o para cualquier ocasión,
          </p>
          <p className="text-sm font-semibold text-foreground mb-6 sm:mb-8">
            ¡Combina nuestros outfits y eleva tu look!
          </p>
          <a
            href="#"
            className="inline-block gold-gradient text-accent-foreground text-sm font-semibold tracking-wider px-8 sm:px-10 py-3 shadow-gold hover:opacity-90 transition-all active:scale-[0.98]"
          >
            SHOP NOW
          </a>
          <div className="mt-8 sm:mt-12 border-b border-accent/30" />
        </div>
      </div>
    </section>
  );
};

export default ElevaTuLook;
