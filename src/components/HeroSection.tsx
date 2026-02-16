import Image from "next/image";
import heroImage from "@/assets/hero-models.jpg";

const HeroSection = () => {
  return (
    <section className="w-full bg-surface-light">
      <div className="w-full relative h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[75vh]">
        <Image
          src={heroImage}
          alt="Amatto Sport - Colección principal"
          fill
          className="object-cover object-top"
          priority
          placeholder="blur"
        />
      </div>

      <div className="flex items-center justify-center gap-3 py-3 sm:py-4 bg-surface-light">
        <button className="w-0 h-0 border-l-[6px] border-l-foreground border-y-[5px] border-y-transparent" />
        <span className="w-2.5 h-2.5 rounded-full bg-foreground" />
        <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/40" />
      </div>
    </section>
  );
};

export default HeroSection;
