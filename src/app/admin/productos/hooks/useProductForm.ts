"use client";

import { useState } from "react";
import { ColorForm, VariantForm } from "../types";
import { SIZES, newColorForm } from "../constants";

export function useProductForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [material, setMaterial] = useState("");
  const [careInfo, setCareInfo] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [generalImages, setGeneralImages] = useState<string[]>([]);
  const [colors, setColors] = useState<ColorForm[]>([]);
  const [showSEO, setShowSEO] = useState(false);
  const [showMaterial, setShowMaterial] = useState(false);

  const reset = () => {
    setName("");
    setDescription("");
    setBasePrice("");
    setComparePrice("");
    setCategoryId("");
    setStatus("ACTIVE");
    setIsFeatured(false);
    setIsNew(false);
    setMaterial("");
    setCareInfo("");
    setMetaTitle("");
    setMetaDescription("");
    setGeneralImages([]);
    setColors([]);
    setShowSEO(false);
    setShowMaterial(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadFromProduct = (data: any) => {
    setName(data.name);
    setDescription(data.description || "");
    setBasePrice(data.basePrice?.toString() || "");
    setComparePrice(data.comparePrice?.toString() || "");
    setCategoryId(data.categoryId);
    setStatus(data.status);
    setIsFeatured(data.isFeatured);
    setIsNew(data.isNew);
    setMaterial(data.material || "");
    setCareInfo(data.careInfo || "");
    setMetaTitle(data.metaTitle || "");
    setMetaDescription(data.metaDescription || "");
    setGeneralImages(data.generalImages || []);
    if (data.material || data.careInfo) setShowMaterial(true);
    if (data.metaTitle || data.metaDescription) setShowSEO(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setColors(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.colors.map((c: any) => ({
        tempId: c.id || crypto.randomUUID(),
        name: c.name,
        hexCode: c.hexCode,
        images: c.images || [],
        variants: Object.fromEntries(
          SIZES.map((s) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const v = c.variants.find((vr: any) => vr.size === s);
            return [
              s,
              {
                stock: v ? v.stock.toString() : "",
                priceOverride: v?.priceOverride ? v.priceOverride.toString() : "",
              },
            ];
          })
        ),
      }))
    );
  };

  const buildPayload = () => ({
    name,
    description,
    basePrice: parseFloat(basePrice),
    comparePrice: comparePrice ? parseFloat(comparePrice) : null,
    categoryId,
    status,
    isFeatured,
    isNew,
    material,
    careInfo,
    metaTitle,
    metaDescription,
    generalImages,
    colors: colors
      .filter((c) => c.name.trim())
      .map((c) => ({
        name: c.name.trim(),
        hexCode: c.hexCode,
        images: c.images,
        variants: Object.entries(c.variants)
          .filter(([, v]) => v.stock && parseInt(v.stock) > 0)
          .map(([size, v]) => ({
            size,
            stock: parseInt(v.stock),
            priceOverride: v.priceOverride ? parseFloat(v.priceOverride) : null,
          })),
      })),
  });

  const addColor = () => setColors((prev) => [...prev, newColorForm()]);

  const removeColor = (tempId: string) =>
    setColors((prev) => prev.filter((c) => c.tempId !== tempId));

  const updateColor = (tempId: string, field: keyof ColorForm, value: string | string[]) =>
    setColors((prev) =>
      prev.map((c) => (c.tempId === tempId ? { ...c, [field]: value } : c))
    );

  const addColorImage = (tempId: string, url: string) =>
    setColors((prev) =>
      prev.map((c) =>
        c.tempId === tempId ? { ...c, images: [...c.images, url] } : c
      )
    );

  const removeColorImage = (tempId: string, url: string) =>
    setColors((prev) =>
      prev.map((c) =>
        c.tempId === tempId
          ? { ...c, images: c.images.filter((i) => i !== url) }
          : c
      )
    );

  const updateVariant = (
    tempId: string,
    size: string,
    field: keyof VariantForm,
    value: string
  ) =>
    setColors((prev) =>
      prev.map((c) =>
        c.tempId === tempId
          ? {
              ...c,
              variants: {
                ...c.variants,
                [size]: { ...c.variants[size], [field]: value },
              },
            }
          : c
      )
    );

  return {
    name, setName,
    description, setDescription,
    basePrice, setBasePrice,
    comparePrice, setComparePrice,
    categoryId, setCategoryId,
    status, setStatus,
    isFeatured, setIsFeatured,
    isNew, setIsNew,
    material, setMaterial,
    careInfo, setCareInfo,
    metaTitle, setMetaTitle,
    metaDescription, setMetaDescription,
    generalImages, setGeneralImages,
    colors,
    showSEO, setShowSEO,
    showMaterial, setShowMaterial,
    reset,
    loadFromProduct,
    buildPayload,
    addColor,
    removeColor,
    updateColor,
    addColorImage,
    removeColorImage,
    updateVariant,
  };
}
