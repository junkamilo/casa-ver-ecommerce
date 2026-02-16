import Link from "next/link";
import Image from "next/image";
import catEnterizoCorto from "@/assets/cat-enterizo-corto.jpg";
import catSets from "@/assets/cat-sets.jpg";
import catChaquetas from "@/assets/cat-chaquetas.jpg";
import catEnterizoLargo from "@/assets/cat-enterizo-largo.jpg";
import catBodys from "@/assets/cat-bodys.jpg";

const categories = [
  { image: catEnterizoCorto, label: "ENTERIZOS CORTOS", slug: "enterizos-cortos" },
  { image: catSets, label: "SETS", slug: "sets" },
  { image: catChaquetas, label: "CHAQUETAS", slug: "chaquetas" },
  { image: catEnterizoLargo, label: "ENTERIZOS LARGOS", slug: "enterizos-largos" },
  { image: catBodys, label: "BODYS", slug: "bodys" },
];

const Categories = () => {
  return (
    <section className="py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-0">
        {categories.map((cat, i) => (
          <Link key={i} href={`/collections/${cat.slug}`} className="flex flex-col cursor-pointer group">
            <div className="w-full aspect-square flex items-center justify-center mb-0 overflow-hidden relative">
              <Image
                src={cat.image}
                alt={cat.label}
                className="object-contain group-hover:scale-105 transition-transform duration-500"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            </div>
            <div className="bg-foreground text-primary-foreground text-center py-2 sm:py-3">
              <span className="text-[10px] sm:text-xs font-semibold tracking-wider">{cat.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Categories;
