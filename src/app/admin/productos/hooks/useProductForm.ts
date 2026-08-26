"use client";

import { useRef, useState } from "react";
import { SelectedColor, SetItemForm } from "../types";
import { newSetItem } from "../utils";
import {
  AdminProductDetailDTO,
  mapAdminProductDetailToFormInitialValues,
  mapProductFormToCreatePayload,
} from "@/modules/adminCatalog/products/presentation/mappers";

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
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [status, setStatus] = useState("ACTIVE");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isProductNew, setIsProductNew] = useState(false);
  const [isProductNewAt, setIsProductNewAt] = useState<string | null>(null);
  const [isOnSale, setIsOnSale] = useState(false);
  const [isOnSaleAt, setIsOnSaleAt] = useState<string | null>(null);
  const [isSuggested, setIsSuggested] = useState(false);
  const [suggestedAt, setSuggestedAt] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([]);
  // Cache de imágenes por nombre de color — se conservan aunque se deseleccione el color
  const colorImageCache = useRef<Record<string, string[]>>({});
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

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
    setCategoryIds([]);
    setStatus("ACTIVE");
    setIsFeatured(false);
    setIsNew(false);
    setIsProductNew(false);
    setIsProductNewAt(null);
    setIsOnSale(false);
    setIsOnSaleAt(null);
    setIsSuggested(false);
    setSuggestedAt(null);
    setSelectedColors([]);
    setSelectedSizes([]);
    setVideoUrl("");
    setCoverImageUrl("");
    setGarmentTypes([]);
    setIsSet(false);
    setSetItems([]);
    colorImageCache.current = {};
  };

  const loadFromProduct = (
    data: AdminProductDetailDTO,
    presetColors: { name: string; hex: string }[] = []
  ) => {
    const catalogByKey = new Map(
      presetColors.map((c) => [normalizeColorName(c.name), c])
    );

    const mapped = mapAdminProductDetailToFormInitialValues(data);

    setName(mapped.name);
    setDescription(mapped.description);
    setBasePrice(mapped.basePrice);
    setComparePrice(mapped.comparePrice);
    setStock(mapped.stock);
    setCategoryIds(mapped.categoryIds);
    setStatus(mapped.status);
    setIsFeatured(mapped.isFeatured);
    setIsNew(mapped.isNew);
    setIsProductNew(mapped.isProductNew);
    setIsProductNewAt(mapped.isProductNewAt);
    setIsOnSale(mapped.isOnSale);
    setIsOnSaleAt(mapped.isOnSaleAt);
    setIsSuggested(mapped.isSuggested);
    setSuggestedAt(mapped.suggestedAt);
    setVideoUrl(mapped.videoUrl);
    setCoverImageUrl(mapped.coverImageUrl || "");
    setGarmentTypes(mapped.garmentTypes);
    setIsSet(mapped.isSet);

    // Parent product colors/sizes always loaded regardless of isSet
    const loadedColors = (mapped.selectedColors || []).map((c) =>
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
    setSelectedSizes(mapped.selectedSizes || []);

    if (mapped.isSet && mapped.setItems.length > 0) {
      setSetItems(mapped.setItems.map((item) => ({
        ...item,
        colors: (item.colors || []).map((c) =>
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
  const buildPayload = () =>
    mapProductFormToCreatePayload({
      name,
      description,
      basePrice,
      comparePrice,
      stock,
      categoryIds,
      status,
      isFeatured,
      isNew,
      isProductNew,
      isProductNewAt,
      isOnSale,
      isOnSaleAt,
      isSuggested,
      suggestedAt,
      videoUrl,
      coverImageUrl,
      garmentTypes,
      isSet,
      selectedColors,
      selectedSizes,
      setItems,
    });

  // ── Helpers colores producto principal ────────────────────────────────────

  const toggleColor = (name: string, hexCode: string) =>
    setSelectedColors((prev) => {
      const key = normalizeColorName(name);
      const existing = prev.find((c) => normalizeColorName(c.name) === key);
      if (existing) {
        if (existing.images.length > 0) {
          colorImageCache.current[name] = existing.images;
        }
        const next = prev.filter((c) => normalizeColorName(c.name) !== key);
        const remainingUrls = new Set(next.flatMap((c) => c.images));
        if (coverImageUrl && !remainingUrls.has(coverImageUrl)) {
          setCoverImageUrl("");
        }
        return next;
      }
      const cachedImages = colorImageCache.current[name] ?? [];
      return [...prev, { name, hexCode, images: cachedImages, variantStocks: {} }];
    });

  const setColorImages = (colorName: string, images: string[]) => {
    setSelectedColors((prev) => {
      const next = prev.map((c) => (c.name === colorName ? { ...c, images } : c));
      const allUrls = next.flatMap((c) => c.images);
      setCoverImageUrl((current) => {
        if (current && allUrls.includes(current)) return current;
        return allUrls[0] ?? "";
      });
      return next;
    });
  };

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

  const addSetItem = () =>
    setSetItems((prev) => [...prev, newSetItem(prev.length === 0)]);

  const removeSetItem = (localId: string) =>
    setSetItems((prev) => {
      const next = prev.filter((i) => i.localId !== localId);
      if (next.length === 0) return next;
      if (next.some((i) => i.isCardFeatured)) return next;
      return next.map((item, index) => ({
        ...item,
        isCardFeatured: index === 0,
      }));
    });

  const updateSetItem = (localId: string, updates: Partial<SetItemForm>) =>
    setSetItems((prev) =>
      prev.map((i) => (i.localId === localId ? { ...i, ...updates } : i))
    );

  const featureSetItemForHome = (localId: string) =>
    setSetItems((prev) =>
      prev.map((i) => ({
        ...i,
        isCardFeatured: i.localId === localId,
      }))
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
        const colors = i.colors.map((c) => (c.name === colorName ? { ...c, images } : c));
        const allUrls = colors.flatMap((c) => c.images);
        const coverImageUrl =
          i.coverImageUrl && allUrls.includes(i.coverImageUrl)
            ? i.coverImageUrl
            : allUrls[0] ?? "";
        return { ...i, colors, coverImageUrl };
      })
    );

  return {
    name, setName,
    description, setDescription,
    basePrice, setBasePrice,
    comparePrice, setComparePrice,
    stock, setStock,
    categoryIds, setCategoryIds,
    status, setStatus,
    isFeatured, setIsFeatured,
    isNew, setIsNew,
    isProductNew, setIsProductNew,
    isProductNewAt, setIsProductNewAt,
    isOnSale, setIsOnSale,
    isOnSaleAt, setIsOnSaleAt,
    isSuggested, setIsSuggested,
    suggestedAt, setSuggestedAt,
    selectedColors,
    selectedSizes,
    videoUrl, setVideoUrl,
    coverImageUrl, setCoverImageUrl,
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
    featureSetItemForHome,
    toggleSetItemColor,
    toggleSetItemSize,
    setSetItemColorImages,
    updateSetItemVariantStock,
  };
}
