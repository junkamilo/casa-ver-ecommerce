import mainImage from "@/assets/product-1.jpg";
import thumb1 from "@/assets/product-2.jpg";
import thumb2 from "@/assets/product-3.jpg";
import thumb3 from "@/assets/product-4.jpg";
import { ProductVariant } from "./types";

export const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] as const;

export const allVariants: ProductVariant[] = [
  {
    name: "SET SHORT BODY CAMISETA",
    type: "Short",
    price: 140000,
    description:
      "Es de nuestra línea premium. Tacto frío, el tejido es de la mejor calidad del mercado, tiene push up más resistente, ya que tiene elástico interno, son cero transparentes y no te dan calor.",
    rating: 5,
    reviews: 1,
    colors: [
      { name: "AZUL BEBÉ", hex: "#a8d4f0" },
      { name: "CAFÉ", hex: "#8b6f5e" },
      { name: "BEIGE", hex: "#d4c4a8" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    gallery: [mainImage, thumb1, thumb2, thumb3, mainImage],
  },
  {
    name: "SET PANTALÓN BODY CAMISETA",
    type: "Pantalón",
    price: 160000,
    description:
      "Mismo tejido tacto frío premium. Versión pantalón largo, ideal para un look más formal pero igual de cómodo. Push up más resistente con elástico interno.",
    rating: 5,
    reviews: 1,
    colors: [
      { name: "AZUL BEBÉ", hex: "#a8d4f0" },
      { name: "CAFÉ", hex: "#8b6f5e" },
      { name: "BEIGE", hex: "#d4c4a8" },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    gallery: [thumb2, thumb3, mainImage, thumb1],
  },
  {
    name: "SET BERMUDA BODY CAMISETA",
    type: "Bermuda",
    price: 150000,
    description:
      "Mismo tejido tacto frío premium. Versión bermuda, el largo perfecto entre short y pantalón. Push up más resistente con elástico interno.",
    rating: 5,
    reviews: 1,
    colors: [
      { name: "AZUL BEBÉ", hex: "#a8d4f0" },
      { name: "CAFÉ", hex: "#8b6f5e" },
      { name: "NEGRO", hex: "#222222" },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    gallery: [thumb3, thumb1, thumb2, mainImage],
  },
  {
    name: "SET CAPRI BODY CAMISETA",
    type: "Capri",
    price: 155000,
    description:
      "Mismo tejido tacto frío premium. Versión capri, ideal para un look casual y fresco. Push up más resistente con elástico interno.",
    rating: 5,
    reviews: 1,
    colors: [
      { name: "CAFÉ", hex: "#8b6f5e" },
      { name: "BEIGE", hex: "#d4c4a8" },
    ],
    sizes: ["S", "M", "L", "XL"],
    gallery: [thumb1, mainImage, thumb2, thumb3],
  },
];
