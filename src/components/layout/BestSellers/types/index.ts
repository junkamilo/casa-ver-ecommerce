import type { CollectionProduct } from "@/components/shared/ProductCollection/types";

export interface BestSellersClientProps {
  items: CollectionProduct[];
}

export interface CarouselButtonProps {
  direction: "left" | "right";
  onClick: () => void;
  visible: boolean;
}

export interface ProductGridProps {
  items: CollectionProduct[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
}
