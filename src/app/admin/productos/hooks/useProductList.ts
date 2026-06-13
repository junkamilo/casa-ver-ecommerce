"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductListItem, Category, PresetColor } from "../types";
import {
  AdminProductsApiError,
  deleteAdminProduct,
  fetchActivePresetColors,
  fetchAdminCategories,
  fetchAdminProducts,
  toggleAdminProduct,
} from "@/modules/adminCatalog/products/presentation/api-client";
import {
  AdminCategoryDTO,
  AdminColorDTO,
  mapAdminCategoriesToUi,
  mapAdminProductsResponseToUi,
  mapPresetColorsToUi,
} from "@/modules/adminCatalog/products/presentation/mappers";
import { DEFAULT_ADMIN_PAGE_SIZE } from "@/components/ui/AdminPagination";

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
  const [pageSize, setPageSizeState] = useState(DEFAULT_ADMIN_PAGE_SIZE);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const fetchProducts = useCallback(async () => {
    setFetchError(null);
    try {
      // Carga todos los productos en múltiples páginas si es necesario
      let allProducts: ProductListItem[] = [];
      let page = 1;
      const limit = 100;

      while (true) {
        const response = await fetchAdminProducts({ page, limit });
        const mappedResponse = mapAdminProductsResponseToUi(response);
        const data = mappedResponse.data;
        allProducts = [...allProducts, ...data];

        const pagination = mappedResponse.pagination;
        if (!pagination || !pagination.hasNextPage) break;
        page++;
      }

      setProducts(allProducts);
      setFilteredProducts(allProducts);
    } catch (error: unknown) {
      if (error instanceof AdminProductsApiError) {
        setFetchError(error.message);
        return;
      }
      setFetchError("Error de conexión al cargar los productos.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetchAdminCategories();
      setCategories(mapAdminCategoriesToUi(response as AdminCategoryDTO[]));
    } catch {
      console.error("Error al cargar categorías");
    }
  }, []);

  const fetchPresetColors = useCallback(async () => {
    try {
      const response = await fetchActivePresetColors();
      setPresetColors(mapPresetColorsToUi(response as AdminColorDTO[]));
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
      await deleteAdminProduct(id);
      await fetchProducts();
      return true;
    } catch {
      return false;
    }
  };

  const toggleActive = async (id: string, currentState: boolean): Promise<boolean> => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !currentState } : p))
    );
    try {
      await toggleAdminProduct(id, !currentState);
      return true;
    } catch {
      // Roll back optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: currentState } : p))
      );
      return false;
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * pageSize,
    page * pageSize
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
    pageSize,
    setPageSize,
  };
}
