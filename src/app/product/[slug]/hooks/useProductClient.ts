"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { UIProduct, UIColor, UIProductItem } from "../types";
import { isVideoUrl } from "../utils";

export function useProductClient(product: UIProduct) {
  const { addToCart, setBuyNow } = useCart();
  const router = useRouter();

  const initialItem =
    product.isSet && product.items.length > 0 ? product.items[0] : null;

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<UIColor | null>(
    initialItem ? (initialItem.colors[0] ?? null) : (product.colors[0] ?? null)
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>(
    product.isSet && product.items.length > 0 ? product.items[0].id : "main"
  );

  // ─── Datos activos según la vista seleccionada ──────────────────────────
  const activeItem: UIProductItem | null =
    activeView === "main"
      ? null
      : (product.items.find((i) => i.id === activeView) ?? null);

  const activeColors = activeItem ? activeItem.colors : product.colors;
  const activeVideoUrl = activeItem ? activeItem.videoUrl : product.videoUrl;
  const activePrice = activeItem ? (activeItem.price ?? product.basePrice) : product.basePrice;
  const activeComparePrice = activeItem ? activeItem.comparePrice : product.comparePrice;
  const activeStock = activeItem ? activeItem.stock : product.stock;
  const activeDescription = activeItem
    ? (activeItem.description ?? product.description)
    : product.description;
  const activeGeneralImages = activeItem ? [] : product.generalImages;

  // ─── Galería maestra ─────────────────────────────────────────────────────
  const masterGallery = useMemo(() => {
    const items: { url: string; color: UIColor | null }[] = [];
    activeGeneralImages
      .filter((url) => !isVideoUrl(url))
      .forEach((url) => items.push({ url, color: null }));
    activeColors.forEach((color) => {
      color.images
        .filter((url) => !isVideoUrl(url))
        .forEach((url) => items.push({ url, color }));
    });
    return items;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGeneralImages, activeColors]);

  const galleryUrls = masterGallery.map((item) => item.url);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleViewSelect = (view: string) => {
    setActiveView(view);
    const item =
      view === "main" ? null : (product.items.find((i) => i.id === view) ?? null);
    setSelectedColor(item ? (item.colors[0] ?? null) : (product.colors[0] ?? null));
    setSelectedSize(null);
    setSelectedImage(0);
  };

  const handleColorSelect = (color: UIColor) => {
    setSelectedColor(color);
    setSelectedSize(null);
    const firstIdx = masterGallery.findIndex((item) => item.color?.id === color.id);
    if (firstIdx !== -1) setSelectedImage(firstIdx);
  };

  const handleImageSelect = (index: number) => {
    setSelectedImage(index);
    const associatedColor = masterGallery[index].color;
    if (associatedColor && associatedColor.id !== selectedColor?.id) {
      setSelectedColor(associatedColor);
      setSelectedSize(null);
    }
  };

  const buildCartProduct = () => {
    if (!selectedSize || !selectedColor) return null;
    const variant = selectedColor.variants.find((v) => v.size === selectedSize);
    const cartName =
      product.isSet && activeItem
        ? `${product.name} — ${activeItem.name}`
        : product.name;
    return {
      id: product.id,
      variantId: variant?.variantId ?? "",
      sku: variant?.sku ?? "",
      name: cartName,
      price: activePrice,
      gallery: galleryUrls,
      image: galleryUrls[0] ?? "",
    };
  };

  const handleAddToCart = () => {
    const cartProduct = buildCartProduct();
    if (!cartProduct || !selectedColor) return;
    addToCart(
      cartProduct,
      quantity,
      { name: selectedColor.name, hex: selectedColor.hex },
      selectedSize!
    );
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 2000);
  };

  const handleBuyNow = () => {
    const cartProduct = buildCartProduct();
    if (!cartProduct || !selectedColor) return;
    setBuyNow(
      cartProduct,
      quantity,
      { name: selectedColor.name, hex: selectedColor.hex },
      selectedSize!
    );
    router.push("/checkout");
  };

  const scrollToReviews = () => {
    document.getElementById("seccion-resenas")?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  return {
    // state
    selectedImage,
    selectedColor,
    quantity,
    setQuantity,
    selectedSize,
    setSelectedSize,
    showAddedNotification,
    openAccordion,
    activeView,
    // computed
    activeItem,
    activeColors,
    activeVideoUrl,
    activePrice,
    activeComparePrice,
    activeStock,
    activeDescription,
    masterGallery,
    galleryUrls,
    // handlers
    handleViewSelect,
    handleColorSelect,
    handleImageSelect,
    handleAddToCart,
    handleBuyNow,
    scrollToReviews,
    toggleAccordion,
  };
}
