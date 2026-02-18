import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import { ProductCard } from "./types/types";

export const products: ProductCard[] = [
  {
    image: product1,
    name: "SET SHORT BODY CAMISETA",
    price: "$140.000",
    rating: 5,
    reviews: "1 reseñas",
    colors: ["#a8d4f0", "#8b6f5e", "#2d2d2d", "#c4a882"],
    colorLabel: "AZUL BEBÉ",
    slug: "set-short-body-camiseta",
  },
  {
    image: product2,
    name: "SET PANT G",
    price: "$150.000",
    badge: "Agotado",
    slug: "set-pant-g",
  },
  {
    image: product3,
    name: "SET PANT ICON",
    price: "$185.000",
    colors: ["#a8d4f0", "#f5f0c4", "#2d2d2d", "#8b6f5e", "#1a1a1a"],
    colorLabel: "AZUL BEBÉ",
    slug: "set-pant-icon",
  },
  {
    image: product4,
    name: "SET AURORA",
    price: "$190.000",
    rating: 3,
    reviews: "1 reseñas",
    colors: ["#d4c4a8", "#8b6f5e", "#1a1a1a"],
    colorLabel: "BEIGE",
    slug: "set-aurora",
  },
  {
    image: product5,
    name: "SET PANT G SIN PUSH",
    price: "$150.000",
    colors: ["#8b6f5e", "#3d6b8a"],
    colorLabel: "CAFÉ",
    slug: "set-pant-g-sin-push",
  },
  {
    image: product5,
    name: "SET PANT G SIN PUSH",
    price: "$150.000",
    colors: ["#8b6f5e", "#3d6b8a"],
    colorLabel: "CAFÉ",
    slug: "set-pant-g-sin-push-2",
  },
];
