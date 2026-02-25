"use client";

import ProductCarousel from "@/components/shared/ProductCarousel";
import { SectionConfig } from "@/components/shared/ProductCarousel/types";
import { items } from "./data";

const config: SectionConfig = {
  eyebrow: "Lanzamientos",
  titleStart: "Nueva",
  titleItalic: "Colección",
  linkHref: "/collections/nueva-coleccion",
  linkText: "VER TODO",
  bgColor: "bg-white",
  decorNumber: "03",
  decorAlign: "left",
  badgeVariant: "gold",
};

const NewCollection = () => <ProductCarousel config={config} items={items} />;

export default NewCollection;
