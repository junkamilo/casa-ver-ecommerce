"use client";

import { useState } from "react";
import { SelectedColor } from "../types";

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
  const [generalImages, setGeneralImages] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showMaterial, setShowMaterial] = useState(false);

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
    setGeneralImages([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setShowMaterial(false);
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
    setGeneralImages(data.generalImages || []);
    if (data.material || data.careInfo) setShowMaterial(true);

    setSelectedColors(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data.colors || []).map((c: any) => ({ name: c.name, hexCode: c.hexCode }))
    );
    setSelectedSizes(data.sizes || []);
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
    generalImages,
    colors: selectedColors,
    sizes: selectedSizes,
  });

  const toggleColor = (name: string, hexCode: string) =>
    setSelectedColors((prev) =>
      prev.some((c) => c.name === name)
        ? prev.filter((c) => c.name !== name)
        : [...prev, { name, hexCode }]
    );

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
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
    generalImages, setGeneralImages,
    selectedColors,
    selectedSizes,
    showMaterial, setShowMaterial,
    reset,
    loadFromProduct,
    buildPayload,
    toggleColor,
    toggleSize,
  };
}
