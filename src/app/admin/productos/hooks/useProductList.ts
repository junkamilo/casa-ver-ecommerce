"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductListItem, Category } from "../types";

export function useProductList() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("Todos");

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      }
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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

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

  const toggleActive = async (id: string, currentState: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !currentState } : p))
    );
    try {
      await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentState }),
      });
    } catch {
      fetchProducts();
    }
  };

  return {
    products,
    filteredProducts,
    categories,
    loading,
    search,
    setSearch,
    filterCategory,
    setFilterCategory,
    fetchProducts,
    deleteProduct,
    toggleActive,
  };
}
