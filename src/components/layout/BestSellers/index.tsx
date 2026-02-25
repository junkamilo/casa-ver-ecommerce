"use client";

import ProductCarousel from "@/components/shared/ProductCarousel";
import { SectionConfig } from "@/components/shared/ProductCarousel/types";
import { products } from "./data";

const config: SectionConfig = {
  eyebrow: "Descubre",
  titleStart: "Los Más",
  titleItalic: "Deseados",
  linkHref: "/collections/mas-vendidos",
  linkText: "VER COLECCIÓN",
  bgColor: "bg-[#FAFAFA]",
  decorNumber: "02",
  decorAlign: "right",
  badgeVariant: "white",
};

const BestSellers = () => <ProductCarousel config={config} items={products} />;

export default BestSellers;
