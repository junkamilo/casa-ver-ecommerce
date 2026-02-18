import Link from "next/link";
import Image, { StaticImageData } from "next/image";

interface CategoryCardProps {
  image: StaticImageData;
  label: string;
  slug: string;
}

const CategoryCard = ({ image, label, slug }: CategoryCardProps) => (
  <Link
    href={`/collections/${slug}`}
    className="group block cursor-pointer w-[45vw] sm:w-[40vw] md:w-[calc(25%-18px)] shrink-0"
  >
    <div className="relative w-full aspect-square overflow-hidden bg-muted">
      <Image
        src={image}
        alt={label}
        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-in-out"
        fill
        sizes="(max-width: 640px) 45vw, (max-width: 768px) 40vw, 25vw"
      />
    </div>
    <div className="bg-foreground text-primary-foreground text-center py-2 sm:py-3">
      <span className="text-[10px] sm:text-xs font-semibold tracking-wider">{label}</span>
    </div>
  </Link>
);

export default CategoryCard;
