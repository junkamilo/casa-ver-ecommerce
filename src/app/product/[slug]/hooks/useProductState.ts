"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { UIProduct, UIColor } from "../types";

export function useProductState(product: UIProduct) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<UIColor | null>(
    product.colors[0] ?? null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const { addToCart } = useCart();

  const gallery =
    selectedColor && selectedColor.images.length > 0
      ? selectedColor.images
      : product.generalImages;

  const handleColorSelect = (color: UIColor) => {
    setSelectedColor(color);
    setSelectedImage(0);
    setSelectedSize(null);
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) return;
    addToCart(
      {
        name: product.name,
        price: product.basePrice,
        gallery,
        image: gallery[0] ?? "",
      },
      quantity,
      { name: selectedColor.name, hex: selectedColor.hex },
      selectedSize
    );
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 2000);
  };

  const scrollToReviews = () => {
    document.getElementById("seccion-resenas")?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleAccordion = (key: string) =>
    setOpenAccordion((prev) => (prev === key ? null : key));

  return {
    selectedImage,
    setSelectedImage,
    quantity,
    setQuantity,
    selectedColor,
    selectedSize,
    setSelectedSize,
    showAddedNotification,
    openAccordion,
    gallery,
    handleColorSelect,
    handleAddToCart,
    scrollToReviews,
    toggleAccordion,
  };
}
