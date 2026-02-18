import new1 from "@/assets/new-1.jpg";
import new3 from "@/assets/new-3.jpg";
import new6 from "@/assets/new-6.jpg";
import product1 from "@/assets/product-1.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import { CollectionItem } from "./types/types";

export const items: CollectionItem[] = [
  {
    image: new1,
    name: "SET PANT BUSO LÍNEAS",
    price: "$170.000",
    slug: "set-pant-buso",
  },
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
  {
    image: new3,
    name: "SET SHORT AZUL EFECTO LAVADO",
    price: "$80.000",
    slug: "set-short-azul",
  },
  {
    image: product4,
    name: "ENTERIZO BOTA ANCHA",
    price: "$170.000",
    slug: "enterizo-bota-ancha",
  },
  {
    image: product3,
    name: "ENTERIZO LARGO CUADRADO",
    price: "$140.000",
    colors: ["#d4c4a8", "#a8d4f0", "#6040a0", "#e890b0"],
    colorLabel: "VAINILLA",
    slug: "enterizo-largo-cuadrado",
  },
  {
    image: new6,
    name: "ENTERIZO LARGO MANGA LARGA",
    price: "$170.000",
    slug: "enterizo-largo-manga",
  },
];
