"use client";

import { useRef, useState } from "react";
import { SelectedColor, SetItemForm, SubProductForm } from "../types";

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

const newSubProduct = (): SubProductForm => ({
  localId: crypto.randomUUID(),
  name: "",
  description: "",
  price: "",
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
  const [isProductNew, setIsProductNew] = useState(false);
  const [isProductNewAt, setIsProductNewAt] = useState<string | null>(null);
  const [isOnSale, setIsOnSale] = useState(false);
  const [isOnSaleAt, setIsOnSaleAt] = useState<string | null>(null);
  const [material, setMaterial] = useState("");
  const [selectedColors, setSelectedColors] = useState<SelectedColor[]>([]);
  // Cache de imágenes por nombre de color — se conservan aunque se deseleccione el color
  const colorImageCache = useRef<Record<string, string[]>>({});
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showMaterial, setShowMaterial] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  // Subcategorías (conjunto)
  const [isSet, setIsSet] = useState(false);
  const [setItems, setSetItems] = useState<SetItemForm[]>([]);

  // Sub-productos vendibles de forma independiente
  const [subProducts, setSubProducts] = useState<SubProductForm[]>([]);

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
    setMaterial("");
    setSelectedColors([]);
    setSelectedSizes([]);
    setShowMaterial(false);
    setVideoUrl("");
    setIsSet(false);
    setSetItems([]);
    setSubProducts([]);
    colorImageCache.current = {};
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
    setIsProductNew(data.isProductNew || false);
    setIsProductNewAt(data.isProductNewAt ? new Date(data.isProductNewAt).toISOString() : null);
    setIsOnSale(data.isOnSale || false);
    setIsOnSaleAt(data.isOnSaleAt ? new Date(data.isOnSaleAt).toISOString() : null);
    setMaterial(data.material || "");
    if (data.material) setShowMaterial(true);
    setVideoUrl(data.videoUrl || "");
    setIsSet(data.isSet || false);

    // Parent product colors/sizes always loaded regardless of isSet
    const loadedColors = (data.colors || []).map((c: any) => ({
      name: c.name,
      hexCode: c.hexCode,
      images: c.images || [],
      variantStocks: c.variantStocks || {},
    }));
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
        colors: (item.colors || []).map((c: any) => ({ name: c.name, hexCode: c.hexCode, images: c.images || [], variantStocks: c.variantStocks || {} })),
        sizes: item.sizes || [],
      })));
    } else {
      setSetItems([]);
    }

    if (data.subProducts?.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setSubProducts(data.subProducts.map((sub: any) => ({
        localId: crypto.randomUUID(),
        name: sub.name || "",
        description: sub.description || "",
        price: sub.price?.toString() || "",
        videoUrl: sub.videoUrl || "",
        stock: sub.stock?.toString() || "",
        colors: (sub.colors || []).map((c: any) => ({ name: c.name, hexCode: c.hexCode, images: c.images || [], variantStocks: c.variantStocks || {} })),
        sizes: sub.sizes || [],
      })));
    } else {
      setSubProducts([]);
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
    description: description || "",
    basePrice: basePrice ? parseFloat(basePrice) : 0,
    comparePrice: comparePrice ? parseFloat(comparePrice) : null,
    stock: effectiveStock,
    categoryId,
    status,
    isFeatured,
    isNew,
    isProductNew,
    isProductNewAt: isProductNewAt ?? null,
    isOnSale,
    isOnSaleAt: isOnSaleAt ?? null,
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
            comparePrice: item.comparePrice ? parseFloat(item.comparePrice) : null,
            videoUrl: item.videoUrl || null,
            stock: effectiveStock,
            colors: item.colors,
            sizes: item.sizes,
          };
        })
      : [],
    subProducts: subProducts.length > 0
      ? subProducts.map((sub) => {
          const hasVariantStocks = sub.colors.some(
            (c) => Object.keys(c.variantStocks || {}).length > 0
          );
          const effectiveStock = hasVariantStocks
            ? sub.colors.reduce(
                (sum, c) =>
                  sum + Object.values(c.variantStocks || {}).reduce((s, v) => s + Number(v), 0),
                0
              )
            : sub.stock ? parseInt(sub.stock, 10) : 0;
          return {
            name: sub.name,
            description: sub.description || null,
            price: sub.price ? parseFloat(sub.price) : null,
            videoUrl: sub.videoUrl || null,
            stock: effectiveStock,
            colors: sub.colors,
            sizes: sub.sizes,
          };
        })
      : [],
  });
  };

  // Helpers colores producto principal
  const toggleColor = (name: string, hexCode: string) =>
    setSelectedColors((prev) => {
      if (prev.some((c) => c.name === name)) {
        // Al deseleccionar: guardar imágenes en caché antes de eliminar
        const color = prev.find((c) => c.name === name);
        if (color && color.images.length > 0) {
          colorImageCache.current[name] = color.images;
        }
        return prev.filter((c) => c.name !== name);
      }
      // Al seleccionar: restaurar imágenes del caché si existen
      const cachedImages = colorImageCache.current[name] ?? [];
      return [...prev, { name, hexCode, images: cachedImages, variantStocks: {} }];
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

  // ── Helpers sub-productos ─────────────────────────────────────────────────

  const addSubProduct = () =>
    setSubProducts((prev) => [...prev, newSubProduct()]);

  const removeSubProduct = (localId: string) =>
    setSubProducts((prev) => prev.filter((s) => s.localId !== localId));

  const updateSubProduct = (localId: string, updates: Partial<SubProductForm>) =>
    setSubProducts((prev) =>
      prev.map((s) => s.localId === localId ? { ...s, ...updates } : s)
    );

  const toggleSubProductColor = (localId: string, colorName: string, hexCode: string) =>
    setSubProducts((prev) =>
      prev.map((s) => {
        if (s.localId !== localId) return s;
        const has = s.colors.some((c) => c.name === colorName);
        const newColors = has
          ? s.colors.filter((c) => c.name !== colorName)
          : [...s.colors, { name: colorName, hexCode, images: [], variantStocks: {} }];
        return { ...s, colors: newColors };
      })
    );

  const toggleSubProductSize = (localId: string, size: string) =>
    setSubProducts((prev) =>
      prev.map((s) => {
        if (s.localId !== localId) return s;
        const adding = !s.sizes.includes(size);
        const newSizes = adding ? [...s.sizes, size] : s.sizes.filter((sz) => sz !== size);
        const newColors = s.colors.map((c) => ({
          ...c,
          variantStocks: adding
            ? { ...(c.variantStocks || {}) }
            : Object.fromEntries(
                Object.entries(c.variantStocks || {}).filter(([sz]) => sz !== size)
              ),
        }));
        return { ...s, sizes: newSizes, colors: newColors };
      })
    );

  const setSubProductColorImages = (localId: string, colorName: string, images: string[]) =>
    setSubProducts((prev) =>
      prev.map((s) => {
        if (s.localId !== localId) return s;
        return { ...s, colors: s.colors.map((c) => c.name === colorName ? { ...c, images } : c) };
      })
    );

  const updateSubProductVariantStock = (localId: string, colorName: string, size: string, stock: number) =>
    setSubProducts((prev) =>
      prev.map((s) => {
        if (s.localId !== localId) return s;
        return {
          ...s,
          colors: s.colors.map((c) =>
            c.name === colorName
              ? {
                  ...c,
                  variantStocks: isNaN(stock)
                    ? Object.fromEntries(Object.entries(c.variantStocks || {}).filter(([sz]) => sz !== size))
                    : { ...(c.variantStocks || {}), [size]: stock },
                }
              : c
          ),
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
    // Sub-productos
    subProducts,
    addSubProduct,
    removeSubProduct,
    updateSubProduct,
    toggleSubProductColor,
    toggleSubProductSize,
    setSubProductColorImages,
    updateSubProductVariantStock,
  };
}
