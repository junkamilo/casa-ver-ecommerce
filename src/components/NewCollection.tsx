import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import new1 from "@/assets/new-1.jpg";
import new3 from "@/assets/new-3.jpg";
import new6 from "@/assets/new-6.jpg";
import product1 from "@/assets/product-1.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

interface CollectionItem {
  image: StaticImageData;
  name: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  colors?: string[];
  colorLabel?: string;
  slug: string; // <--- LA CLAVE PARA LA NAVEGACIÓN
}

const items: CollectionItem[] = [
  { image: new1, name: "SET PANT BUSO LÍNEAS", price: "$170.000", slug: "set-pant-buso" },
  {
    image: product1,
    name: "SHORT LICRADO",
    price: "$41.650",
    oldPrice: "$60.000",
    badge: "Oferta",
    colors: ["#e8c8d8", "#5c4a3e", "#e06080", "#2c3060", "#2a7040"],
    colorLabel: "ROSADO BEBÉ",
    slug: "short-licrado",
  },
  { image: new3, name: "SET SHORT AZUL EFECTO LAVADO", price: "$80.000", slug: "set-short-azul" },
  { image: product4, name: "ENTERIZO BOTA ANCHA", price: "$170.000", slug: "enterizo-bota-ancha" },
  {
    image: product3,
    name: "ENTERIZO LARGO CUADRADO",
    price: "$140.000",
    colors: ["#d4c4a8", "#a8d4f0", "#6040a0", "#e890b0"],
    colorLabel: "VAINILLA",
    slug: "enterizo-largo-cuadrado",
  },
  { image: new6, name: "ENTERIZO LARGO MANGA LARGA", price: "$170.000", slug: "enterizo-largo-manga" },
];

const NewCollection = () => {
  return (
    <section className="py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <h2 className="text-xl sm:text-2xl font-bold text-center tracking-wider text-foreground mb-6 sm:mb-8 lg:mb-10">
        NUEVA COLECCIÓN
      </h2>
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {items.map((item, i) => (
          <Link
            href={`/product/${item.slug}`}
            key={i}
            className="min-w-40 sm:min-w-50 lg:min-w-55 flex-1 cursor-pointer group block"
          >
            <div className="relative overflow-hidden mb-2 sm:mb-3">
              <Image
                src={item.image}
                alt={item.name}
                className="w-full aspect-3/4 object-cover group-hover:scale-105 transition-transform duration-500"
                placeholder="blur"
              />
              {item.badge && (
                <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs px-3 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
            <h3 className="text-xs font-semibold tracking-wider text-foreground mb-1 uppercase">
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-foreground">{item.price}</span>
              {item.oldPrice && (
                <span className="text-sm text-muted-foreground line-through">{item.oldPrice}</span>
              )}
            </div>
            {item.colorLabel && (
              <p className="text-xs text-muted-foreground tracking-wider mb-2">
                COLOR: {item.colorLabel}
              </p>
            )}
            {item.colors && (
              <div className="flex gap-1.5">
                {item.colors.map((color, ci) => (
                  <span
                    key={ci}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
};

export default NewCollection;
