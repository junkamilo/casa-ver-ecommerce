import { Instagram } from "lucide-react";

const InstagramCTA = () => {
  return (
    <section className="py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 bg-background text-center">
      <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-foreground mx-auto mb-2 sm:mb-3" />
      <h3 className="text-xs sm:text-sm font-bold tracking-wider text-foreground mb-2">
        SÍGUENOS EN INSTAGRAM!
      </h3>
      <a href="#" className="text-xs sm:text-sm text-brand hover:underline">
        @casa_verde
      </a>
    </section>
  );
};

export default InstagramCTA;
