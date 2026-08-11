"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useCart,
  CHECKOUT_MODE_KEY,
  CHECKOUT_MODE_BUY_NOW,
} from "@/context/CartContext";
import {
  type UIProduct,
  type UIColor,
  type UIProductItem,
} from "../../contracts/product-detail.dto";
import { isVideoUrl } from "../../domain/video-url.entity";

export type GalleryMediaItem = {
  url: string;
  color: UIColor | null;
  isVideo: boolean;
};

/**
 * Hook UI del PDP. Encapsula el estado de selección de vista (set vs main),
 * color, talla, cantidad, accordeon y galería maestra. Provee handlers
 * coherentes para añadir al carrito y "Comprar ahora" (que redirige a checkout).
 */
export function useProductClient(
  product: UIProduct,
  initialItemId?: string | null,
) {
  const { addToCart, setBuyNow } = useCart();
  const router = useRouter();

  const preferredItem =
    product.isSet && initialItemId
      ? product.items.find((item) => item.id === initialItemId) ?? null
      : null;

  const initialItem =
    preferredItem ??
    (product.isSet && product.items.length > 0 ? product.items[0] : null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<UIColor | null>(
    initialItem ? (initialItem.colors[0] ?? null) : (product.colors[0] ?? null),
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showAddedNotification, setShowAddedNotification] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>(
    initialItem ? initialItem.id : "main",
  );

  const activeItem: UIProductItem | null =
    activeView === "main"
      ? null
      : (product.items.find((i) => i.id === activeView) ?? null);

  const activeColors = activeItem ? activeItem.colors : product.colors;
  const activeVideoUrl = activeItem ? activeItem.videoUrl : product.videoUrl;
  const activePrice = activeItem
    ? (activeItem.price ?? product.basePrice)
    : product.basePrice;
  const activeComparePrice = activeItem
    ? activeItem.comparePrice
    : product.comparePrice;
  const activeStock = activeItem ? activeItem.stock : product.stock;
  const activeDescription = activeItem
    ? (activeItem.description ?? product.description)
    : product.description;

  // Galería maestra: incluye imágenes Y videos por color (y generales).
  const masterGallery = useMemo((): GalleryMediaItem[] => {
    const items: GalleryMediaItem[] = [];
    const activeGeneralImages = activeItem ? [] : product.generalImages;

    activeGeneralImages.forEach((url) => {
      items.push({ url, color: null, isVideo: isVideoUrl(url) });
    });

    activeColors.forEach((color) => {
      color.images.forEach((url) => {
        items.push({ url, color, isVideo: isVideoUrl(url) });
      });
    });

    return items;
  }, [activeItem, product.generalImages, activeColors]);

  const galleryUrls = masterGallery.map((item) => item.url);

  const handleViewSelect = (view: string) => {
    setActiveView(view);
    const item =
      view === "main"
        ? null
        : (product.items.find((i) => i.id === view) ?? null);
    setSelectedColor(
      item ? (item.colors[0] ?? null) : (product.colors[0] ?? null),
    );
    setSelectedSize(null);
    setSelectedImage(0);
  };

  const handleColorSelect = (color: UIColor) => {
    setSelectedColor(color);
    setSelectedSize(null);
    const firstIdx = masterGallery.findIndex(
      (item) => item.color?.id === color.id,
    );
    if (firstIdx !== -1) setSelectedImage(firstIdx);
  };

  const handleImageSelect = (index: number) => {
    setSelectedImage(index);
    const associatedColor = masterGallery[index]?.color;
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
    const firstImage =
      galleryUrls.find((url) => !isVideoUrl(url)) ?? galleryUrls[0] ?? "";
    return {
      id: product.id,
      variantId: variant?.variantId ?? "",
      sku: variant?.sku ?? "",
      name: cartName,
      price: activePrice,
      gallery: galleryUrls,
      image: firstImage,
    };
  };

  const handleAddToCart = () => {
    const cartProduct = buildCartProduct();
    if (!cartProduct || !selectedColor) return;
    addToCart(
      cartProduct,
      quantity,
      { name: selectedColor.name },
      selectedSize!,
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
      { name: selectedColor.name },
      selectedSize!,
    );
    try {
      sessionStorage.setItem(CHECKOUT_MODE_KEY, CHECKOUT_MODE_BUY_NOW);
    } catch {
      // sessionStorage no disponible
    }
    router.push("/checkout");
  };

  const scrollToReviews = () => {
    document
      .getElementById("seccion-resenas")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? null : key));
  };

  return {
    selectedImage,
    selectedColor,
    quantity,
    setQuantity,
    selectedSize,
    setSelectedSize,
    showAddedNotification,
    openAccordion,
    activeView,
    activeItem,
    activeColors,
    activeVideoUrl,
    activePrice,
    activeComparePrice,
    activeStock,
    activeDescription,
    masterGallery,
    galleryUrls,
    handleViewSelect,
    handleColorSelect,
    handleImageSelect,
    handleAddToCart,
    handleBuyNow,
    scrollToReviews,
    toggleAccordion,
  };
}
