"use client";

import { useRef, useState } from "react";
import { SelectedColor, SetItemForm } from "../types";
import { calcEffectiveStock, newSetItem } from "../utils";

function normalizeColorName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function resolveCanonicalColor(
  color: SelectedColor,
  catalogByKey: Map<string, { name: string; hex: string }>
): SelectedColor {
  const key = normalizeColorName(color.name);
  const canonical = catalogByKey.get(key);
  if (!canonical) return color;
  return {
    ...color,
    name: canonical.name,
    hexCode: canonical.hex,
  };
}

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
  const [isProductNew, setIsProductNew] = useState(false);
  const [isProductNewAt, setIsProductNewAt] = useState<string | null>(null);
  const [isOnSale, setIsOnSale] = useState(false);
  const [isOnSaleAt, setIsOnSaleAt] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([]);
  // Cache de imágenes por nombre de color — se conservan aunque se deseleccione el color
  const colorImageCache = useRef<Record<string, string[]>>({});
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");

  const [garmentTypes, setGarmentTypes] = useState<string[]>([]);

  // Subcategorías (conjunto)
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
    setIsProductNew(false);
    setIsProductNewAt(null);
    setIsOnSale(false);
    setIsOnSaleAt(null);
    setSelectedColors([]);
    setSelectedSizes([]);
    setVideoUrl("");
    setGarmentTypes([]);
    setIsSet(false);
    setSetItems([]);
    colorImageCache.current = {};
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadFromProduct = (
    data: any,
    presetColors: { name: string; hex: string }[] = []
  ) => {
    const catalogByKey = new Map(
      presetColors.map((c) => [normalizeColorName(c.name), c])
    );

    setName(data.name);
    setDescription(data.description || "");
    setBasePrice(data.basePrice?.toString() || "");
    setComparePrice(data.comparePrice?.toString() || "");
    setStock(data.stock?.toString() || "");
    setCategoryId(data.categoryId);
    setStatus(data.status);
    setIsFeatured(data.isFeatured);
    setIsNew(data.isNew);
    setIsProductNew(data.isProductNew || false);
    setIsProductNewAt(data.isProductNewAt ? new Date(data.isProductNewAt).toISOString() : null);
    setIsOnSale(data.isOnSale || false);
    setIsOnSaleAt(data.isOnSaleAt ? new Date(data.isOnSaleAt).toISOString() : null);
    setVideoUrl(data.videoUrl || "");
    setGarmentTypes(data.garmentTypes ?? []);
    setIsSet(data.isSet || false);

    // Parent product colors/sizes always loaded regardless of isSet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const loadedColors = (data.colors || []).map((c: any) =>
      resolveCanonicalColor(
        {
          name: c.name,
          hexCode: c.hexCode,
          images: c.images || [],
          variantStocks: c.variantStocks || {},
        },
        catalogByKey
      )
    );
    // Precargar caché con imágenes existentes para preservarlas si el admin deselecciona
    colorImageCache.current = {};
    for (const c of loadedColors) {
      if (c.images.length > 0) colorImageCache.current[c.name] = c.images;
    }
    setSelectedColors(loadedColors);
    setSelectedSizes(data.sizes || []);

    if (data.isSet && data.items?.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSetItems(data.items.map((item: any) => ({
        localId: crypto.randomUUID(),
        name: item.name || "",
        description: item.description || "",
        price: item.price?.toString() || "",
        comparePrice: item.comparePrice != null ? String(item.comparePrice) : "",
        videoUrl: item.videoUrl || "",
        stock: item.stock?.toString() || "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        colors: (item.colors || []).map((c: any) =>
          resolveCanonicalColor(
            {
              name: c.name,
              hexCode: c.hexCode,
              images: c.images || [],
              variantStocks: c.variantStocks || {},
            },
            catalogByKey
          )
        ),
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
  const buildPayload = () => ({
    name,
    description: description || "",
    basePrice: basePrice ? parseFloat(basePrice) : 0,
    comparePrice: comparePrice ? parseFloat(comparePrice) : null,
    stock: calcEffectiveStock(selectedColors, stock),
    categoryId,
    status,
    isFeatured,
    isNew,
    isProductNew,
    isProductNewAt: isProductNewAt ?? null,
    isOnSale,
    isOnSaleAt: isOnSaleAt ?? null,
    videoUrl: videoUrl || null,
    garmentTypes,
    isSet,
    colors: selectedColors,
    sizes: selectedSizes,
    items: isSet
      ? setItems.map((item) => ({
          name: item.name,
          description: item.description || null,
          price: item.price ? parseFloat(item.price) : null,
          comparePrice: item.comparePrice ? parseFloat(item.comparePrice) : null,
          videoUrl: item.videoUrl || null,
          stock: calcEffectiveStock(item.colors, item.stock),
          colors: item.colors,
          sizes: item.sizes,
        }))
      : [],
  });

  // ── Helpers colores producto principal ────────────────────────────────────

  const toggleColor = (name: string, hexCode: string) =>
    setSelectedColors((prev) => {
      const key = normalizeColorName(name);
      const existing = prev.find((c) => normalizeColorName(c.name) === key);
      if (existing) {
        // Al deseleccionar: guardar imágenes en caché antes de eliminar
        if (existing.images.length > 0) {
          colorImageCache.current[name] = existing.images;
        }
        return prev.filter((c) => normalizeColorName(c.name) !== key);
      }
      // Al seleccionar: restaurar imágenes del caché si existen
      const cachedImages = colorImageCache.current[name] ?? [];
      return [...prev, { name, hexCode, images: cachedImages, variantStocks: {} }];
    });

  const setColorImages = (colorName: string, images: string[]) =>
    setSelectedColors((prev) =>
      prev.map((c) => (c.name === colorName ? { ...c, images } : c))
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

  // ── Helpers subcategorías ─────────────────────────────────────────────────

  const addSetItem = () => setSetItems((prev) => [...prev, newSetItem()]);

  const removeSetItem = (localId: string) =>
    setSetItems((prev) => prev.filter((i) => i.localId !== localId));

  const updateSetItem = (localId: string, updates: Partial<SetItemForm>) =>
    setSetItems((prev) =>
      prev.map((i) => (i.localId === localId ? { ...i, ...updates } : i))
    );

  const toggleSetItemColor = (localId: string, colorName: string, hexCode: string) =>
    setSetItems((prev) =>
      prev.map((i) => {
        if (i.localId !== localId) return i;
        const key = normalizeColorName(colorName);
        const has = i.colors.some((c) => normalizeColorName(c.name) === key);
        const newColors = has
          ? i.colors.filter((c) => normalizeColorName(c.name) !== key)
          : [...i.colors, { name: colorName, hexCode, images: [], variantStocks: {} }];
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

  const updateSetItemVariantStock = (
    localId: string,
    colorName: string,
    size: string,
    stock: number
  ) =>
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
                    ? Object.fromEntries(
                        Object.entries(c.variantStocks || {}).filter(([s]) => s !== size)
                      )
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
          colors: i.colors.map((c) => (c.name === colorName ? { ...c, images } : c)),
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
    isProductNew, setIsProductNew,
    isProductNewAt, setIsProductNewAt,
    isOnSale, setIsOnSale,
    isOnSaleAt, setIsOnSaleAt,
    selectedColors,
    selectedSizes,
    videoUrl, setVideoUrl,
    garmentTypes, setGarmentTypes,
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
