"use client";

import { useState } from "react";
import { SelectedColor, SetItemForm } from "../types";

const newSetItem = (): SetItemForm => ({
  localId: crypto.randomUUID(),
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  videoUrl: "",
  stock: "",
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
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showMaterial, setShowMaterial] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  // Subcategorías
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
    if (data.material) setShowMaterial(true);
    setVideoUrl(data.videoUrl || "");
    setIsSet(data.isSet || false);

    // Parent product colors/sizes always loaded regardless of isSet
    setSelectedColors(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (data.colors || []).map((c: any) => ({
        name: c.name,
        hexCode: c.hexCode,
        images: c.images || [],
        variantStocks: c.variantStocks || {},
      }))
    );
    setSelectedSizes(data.sizes || []);

    if (data.isSet && data.items?.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSetItems(data.items.map((item: any) => ({
        localId: crypto.randomUUID(),
        name: item.name || "",
        description: item.description || "",
        price: item.price?.toString() || "",
        videoUrl: item.videoUrl || "",
        stock: item.stock?.toString() || "",
        colors: (item.colors || []).map((c: any) => ({ name: c.name, hexCode: c.hexCode, images: c.images || [], variantStocks: c.variantStocks || {} })),
        sizes: item.sizes || [],
      })));
    } else {
      setSetItems([]);
    }
  };

  const updateVariantStock = (colorName: string, size: string, newStock: number) =>
    setSelectedColors((prev) =>
      prev.map((c) =>
        c.name === colorName
          ? {
              ...c,
              variantStocks: isNaN(newStock)
                ? Object.fromEntries(Object.entries(c.variantStocks || {}).filter(([s]) => s !== size))
                : { ...(c.variantStocks || {}), [size]: newStock },
            }
          : c
      )
    );

  // Parent product fields are ALWAYS included in payload regardless of isSet.
  // When isSet=true, subcategory items are added on top.
  const buildPayload = () => {
    const hasVariantStocks = selectedColors.some(
      (c) => Object.keys(c.variantStocks || {}).length > 0
    );
    const effectiveStock = hasVariantStocks
      ? selectedColors.reduce(
          (sum, c) =>
            sum + Object.values(c.variantStocks || {}).reduce((s, v) => s + Number(v), 0),
          0
        )
      : stock ? parseInt(stock, 10) : 0;

    return ({
    name,
    description,
    basePrice: parseFloat(basePrice),
    comparePrice: comparePrice ? parseFloat(comparePrice) : null,
    stock: effectiveStock,
    categoryId,
    status,
    isFeatured,
    isNew,
    material,
    videoUrl: videoUrl || null,
    isSet,
    colors: selectedColors,
    sizes: selectedSizes,
    items: isSet
      ? setItems.map((item) => {
          const hasVariantStocks = item.colors.some(
            (c) => Object.keys(c.variantStocks || {}).length > 0
          );
          const effectiveStock = hasVariantStocks
            ? item.colors.reduce(
                (sum, c) =>
                  sum + Object.values(c.variantStocks || {}).reduce((s, v) => s + Number(v), 0),
                0
              )
            : item.stock ? parseInt(item.stock, 10) : 0;
          return {
            name: item.name,
            description: item.description || null,
            price: item.price ? parseFloat(item.price) : null,
            videoUrl: item.videoUrl || null,
            stock: effectiveStock,
            colors: item.colors,
            sizes: item.sizes,
          };
        })
      : [],
  });
  };

  // Helpers colores producto principal
  const toggleColor = (name: string, hexCode: string) =>
    setSelectedColors((prev) => {
      const newColors = prev.some((c) => c.name === name)
        ? prev.filter((c) => c.name !== name)
        : [...prev, { name, hexCode, images: [], variantStocks: {} }];

      // Inicializar variantStocks para el nuevo color con todas las tallas actuales
      return newColors.map((c) => (
        c.variantStocks && Object.keys(c.variantStocks).length > 0
          ? c
          : { ...c, variantStocks: {} }
      ));
    });

  const setColorImages = (colorName: string, images: string[]) =>
    setSelectedColors((prev) =>
      prev.map((c) => c.name === colorName ? { ...c, images } : c)
    );

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) => {
      const newSizes = prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size];

      // Actualizar variantStocks de todos los colores cuando se agregan/quitan tallas
      setSelectedColors((colors) =>
        colors.map((c) => ({
          ...c,
          variantStocks: {
            ...c.variantStocks,
            // Si se agregó una talla, iniciarla con 0; si se quitó, eliminarla
            ...(!prev.includes(size) && newSizes.includes(size) && {}),
            ...(prev.includes(size) &&
              !newSizes.includes(size) &&
              Object.fromEntries(
                Object.entries(c.variantStocks || {}).filter(([s]) => s !== size)
              )),
          },
        }))
      );

      return newSizes;
    });
  };

  // Helpers subcategorías
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
        const newColors = has
          ? i.colors.filter((c) => c.name !== colorName)
          : [...i.colors, {
              name: colorName,
              hexCode,
              images: [],
              variantStocks: {},
            }];
        return { ...i, colors: newColors };
      })
    );

  const toggleSetItemSize = (localId: string, size: string) =>
    setSetItems((prev) =>
      prev.map((i) => {
        if (i.localId !== localId) return i;
        const adding = !i.sizes.includes(size);
        const newSizes = adding ? [...i.sizes, size] : i.sizes.filter((s) => s !== size);
        const newColors = i.colors.map((c) => ({
          ...c,
          variantStocks: adding
            ? { ...(c.variantStocks || {}) }
            : Object.fromEntries(
                Object.entries(c.variantStocks || {}).filter(([s]) => s !== size)
              ),
        }));
        return { ...i, sizes: newSizes, colors: newColors };
      })
    );

  const updateSetItemVariantStock = (localId: string, colorName: string, size: string, stock: number) =>
    setSetItems((prev) =>
      prev.map((i) => {
        if (i.localId !== localId) return i;
        return {
          ...i,
          colors: i.colors.map((c) =>
            c.name === colorName
              ? {
                  ...c,
                  variantStocks: isNaN(stock)
                    ? Object.fromEntries(Object.entries(c.variantStocks || {}).filter(([s]) => s !== size))
                    : { ...(c.variantStocks || {}), [size]: stock },
                }
              : c
          ),
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
    updateVariantStock,
    addSetItem,
    removeSetItem,
    updateSetItem,
    toggleSetItemColor,
    toggleSetItemSize,
    setSetItemColorImages,
    updateSetItemVariantStock,
  };
}
