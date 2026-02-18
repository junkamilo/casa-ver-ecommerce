import Image from "next/image";
import { StaticImageData } from "next/image";

interface Props {
  gallery: StaticImageData[];
  selectedImage: number;
  productName: string;
  onSelect: (index: number) => void;
}

export default function ProductGallery({
  gallery,
  selectedImage,
  productName,
  onSelect,
}: Props) {
  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3 sm:gap-4 lg:sticky lg:top-4 lg:self-start">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-2 sm:gap-3 overflow-x-auto lg:overflow-visible py-2 lg:py-0 scrollbar-hide">
        {gallery.map((img, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`relative w-14 h-18 sm:w-20 sm:h-24 shrink-0 border-2 transition-all ${
              selectedImage === i
                ? "border-foreground"
                : "border-transparent hover:border-border"
            }`}
          >
            <Image src={img} alt={`Vista ${i}`} fill className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative w-full max-h-[500px] sm:max-h-[580px] lg:max-h-[620px] aspect-[3/4] bg-muted overflow-hidden">
        <Image
          src={gallery[selectedImage]}
          alt={productName}
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
