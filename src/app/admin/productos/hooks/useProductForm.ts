"use client";

import { useState } from "react";
import { SelectedColor, SetItemForm } from "../types";

const newSetItem = (): SetItemForm => ({
  localId: crypto.randomUUID(),
  name: "",
  price: "",
  videoUrl: "",
  stock: "0",
  colors: [],
  sizes: [],
});

export function useProductForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [material, setMaterial] = useState("");
  const [careInfo, setCareInfo] = useState("");
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showMaterial, setShowMaterial] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  // Conjuntos
  const [isSet, setIsSet] = useState(false);
  const [setItems, setSetItems] = useState<SetItemForm[]>([]);

  const reset = () => {
    setName("");
    setDescription("");
    setBasePrice("");
    setComparePrice("");
    setStock("");
    setCategoryId("");
    setStatus("ACTIVE");
    setIsFeatured(false);
    setIsNew(false);
    setMaterial("");
    setCareInfo("");
    setSelectedColors([]);
    setSelectedSizes([]);
    setShowMaterial(false);
    setVideoUrl("");
    setIsSet(false);
    setSetItems([]);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadFromProduct = (data: any) => {
    setName(data.name);
    setDescription(data.description || "");
    setBasePrice(data.basePrice?.toString() || "");
    setComparePrice(data.comparePrice?.toString() || "");
    setStock(data.stock?.toString() || "");
    setCategoryId(data.categoryId);
    setStatus(data.status);
    setIsFeatured(data.isFeatured);
    setIsNew(data.isNew);
    setMaterial(data.material || "");
    setCareInfo(data.careInfo || "");
    if (data.material || data.careInfo) setShowMaterial(true);
    setIsSet(data.isSet || false);

    if (data.isSet && data.items?.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSetItems(data.items.map((item: any) => ({
        localId: crypto.randomUUID(),
        name: item.name || "",
        price: item.price?.toString() || "",
        videoUrl: item.videoUrl || "",
        stock: item.stock?.toString() || "0",
        colors: (item.colors || []).map((c: any) => ({ name: c.name, hexCode: c.hexCode, images: c.images || [] })),
        sizes: item.sizes || [],
      })));
      setSelectedColors([]);
      setSelectedSizes([]);
    } else {
      setSelectedColors(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.colors || []).map((c: any) => ({ name: c.name, hexCode: c.hexCode, images: c.images || [] }))
      );
      setSelectedSizes(data.sizes || []);
      setSetItems([]);
    }

    setVideoUrl(data.videoUrl || "");
  };

  const buildPayload = () => ({
    name,
    description,
    basePrice: parseFloat(basePrice),
    comparePrice: comparePrice ? parseFloat(comparePrice) : null,
    stock: stock ? parseInt(stock) : 0,
    categoryId,
    status,
    isFeatured,
    isNew,
    material,
    careInfo,
    videoUrl: isSet ? null : (videoUrl || null),
    isSet,
    colors: isSet ? [] : selectedColors,
    sizes: isSet ? [] : selectedSizes,
    items: isSet
      ? setItems.map((item) => ({
          name: item.name,
          price: item.price ? parseFloat(item.price) : null,
          videoUrl: item.videoUrl || null,
          stock: item.stock ? parseInt(item.stock) : 0,
          colors: item.colors,
          sizes: item.sizes,
        }))
      : [],
  });

  // Helpers colores producto simple
  const toggleColor = (name: string, hexCode: string) =>
    setSelectedColors((prev) =>
      prev.some((c) => c.name === name)
        ? prev.filter((c) => c.name !== name)
        : [...prev, { name, hexCode, images: [] }]
    );

  const setColorImages = (colorName: string, images: string[]) =>
    setSelectedColors((prev) =>
      prev.map((c) => c.name === colorName ? { ...c, images } : c)
    );

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  // Helpers set items
  const addSetItem = () =>
    setSetItems((prev) => [...prev, newSetItem()]);

  const removeSetItem = (localId: string) =>
    setSetItems((prev) => prev.filter((i) => i.localId !== localId));

  const updateSetItem = (localId: string, updates: Partial<SetItemForm>) =>
    setSetItems((prev) =>
      prev.map((i) => i.localId === localId ? { ...i, ...updates } : i)
    );

  const toggleSetItemColor = (localId: string, colorName: string, hexCode: string) =>
    setSetItems((prev) =>
      prev.map((i) => {
        if (i.localId !== localId) return i;
        const has = i.colors.some((c) => c.name === colorName);
        return {
          ...i,
          colors: has
            ? i.colors.filter((c) => c.name !== colorName)
            : [...i.colors, { name: colorName, hexCode, images: [] }],
        };
      })
    );

  const toggleSetItemSize = (localId: string, size: string) =>
    setSetItems((prev) =>
      prev.map((i) => {
        if (i.localId !== localId) return i;
        return {
          ...i,
          sizes: i.sizes.includes(size)
            ? i.sizes.filter((s) => s !== size)
            : [...i.sizes, size],
        };
      })
    );

  const setSetItemColorImages = (localId: string, colorName: string, images: string[]) =>
    setSetItems((prev) =>
      prev.map((i) => {
        if (i.localId !== localId) return i;
        return {
          ...i,
          colors: i.colors.map((c) => c.name === colorName ? { ...c, images } : c),
        };
      })
    );

  return {
    name, setName,
    description, setDescription,
    basePrice, setBasePrice,
    comparePrice, setComparePrice,
    stock, setStock,
    categoryId, setCategoryId,
    status, setStatus,
    isFeatured, setIsFeatured,
    isNew, setIsNew,
    material, setMaterial,
    careInfo, setCareInfo,
    selectedColors,
    selectedSizes,
    showMaterial, setShowMaterial,
    videoUrl, setVideoUrl,
    isSet, setIsSet,
    setItems,
    reset,
    loadFromProduct,
    buildPayload,
    toggleColor,
    toggleSize,
    setColorImages,
    addSetItem,
    removeSetItem,
    updateSetItem,
    toggleSetItemColor,
    toggleSetItemSize,
    setSetItemColorImages,
  };
}
