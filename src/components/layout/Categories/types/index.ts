export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  isActive: boolean;
}

export interface CategoryCardProps {
  image: string | null;
  label: string;
  slug: string;
}

export interface CarouselNavButtonProps {
  direction: "left" | "right";
  onClick: () => void;
}
