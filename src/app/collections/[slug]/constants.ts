import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import new1 from "@/assets/new-1.jpg";
import new3 from "@/assets/new-3.jpg";
import new6 from "@/assets/new-6.jpg";

import type { CollectionProduct } from "./types";

export const COLLECTION_PRODUCTS: CollectionProduct[] = [
  { image: product1, name: "ENTERIZO COCOA", price: 81880, oldPrice: 90000, badge: "Oferta", slug: "enterizo-cocoa" },
  { image: product2, name: "ENTERIZO CORAL", price: 81880, oldPrice: 90000, badge: "Oferta", slug: "enterizo-coral" },
  { image: new1, name: "MEDIAS", price: 22000, colorLabel: "GRIS", colors: ["#e0e0e0", "#ffffff"], slug: "medias" },
  { image: new3, name: "ENTERIZO CORTO MANGA LARGA H", price: 140000, colorLabel: "AZUL BEBÉ", colors: ["#a8d4f0", "#8b6f5e", "#d4c4a8"], slug: "enterizo-corto-manga" },
  { image: product4, name: "SET SHORT SESGO", price: 120000, slug: "set-short-sesgo" },
  { image: product3, name: "ENTERIZO CORTO CAMISETA", price: 125000, slug: "enterizo-corto-camiseta" },
  { image: new6, name: "BODY BASIC", price: 90000, slug: "body-basic" },
  { image: product2, name: "VESTIDO CAMISETA", price: 140000, slug: "vestido-camiseta" },
];

export const MAX_PRICE = 180000;
