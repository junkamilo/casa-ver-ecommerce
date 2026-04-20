"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductListItem, Category, PresetColor } from "../types";

const PAGE_SIZE = 8;

export function useProductList() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [presetColors, setPresetColors] = useState<PresetColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todos");
  const [page, setPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    setFetchError(null);
    try {
      const res = await fetch("/api/admin/products");
      if (!res.ok) {
        setFetchError("No se pudieron cargar los productos. Intenta de nuevo.");
        return;
      }
      const data = await res.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch {
      setFetchError("Error de conexión al cargar los productos.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) setCategories(await res.json());
    } catch {
      console.error("Error al cargar categorías");
    }
  }, []);

  const fetchPresetColors = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/colors?active=true");
      if (res.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any[] = await res.json();
        setPresetColors(data.map((c) => ({ name: c.name, hex: c.hexCode })));
      }
    } catch {
      console.error("Error al cargar colores");
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchPresetColors();
  }, [fetchProducts, fetchCategories, fetchPresetColors]);

  // Resetea a página 1 solo cuando el usuario cambia filtros, no cuando se recargan datos
  useEffect(() => {
    setPage(1);
  }, [search, filterCategory]);

  useEffect(() => {
    let result = products;
    if (search)
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    if (filterCategory !== "Todos")
      result = result.filter((p) => p.category?.name === filterCategory);
    setFilteredProducts(result);
  }, [search, filterCategory, products]);

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchProducts();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const toggleActive = async (id: string, currentState: boolean): Promise<boolean> => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !currentState } : p))
    );
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentState }),
      });
      if (!res.ok) throw new Error("Failed");
      return true;
    } catch {
      // Roll back optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: currentState } : p))
      );
      return false;
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return {
    products,
    filteredProducts,
    paginatedProducts,
    categories,
    presetColors,
    loading,
    fetchError,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    fetchProducts,
    deleteProduct,
    toggleActive,
    page,
    setPage,
    totalPages,
    pageSize: PAGE_SIZE,
  };
}
