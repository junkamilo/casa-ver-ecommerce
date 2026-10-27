"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Info } from "lucide-react";
import type { ProductListItem, ToastState } from "./types";
import ToastNotification from "./components/ToastNotification";
import ProductFilters from "./components/ProductFilters";
import ProductTable from "./components/ProductTable";
import PosProductModal from "./components/PosProductModal";
import AdminPagination from "@/components/ui/AdminPagination";
import AdminPageHeader from "@/components/ui/AdminPageHeader";
import { fetchAdminProducts } from "@/modules/adminCatalog/products/presentation/api-client";
import { posProductsUrl } from "@/lib/pos-links";

const ALL_LABEL = "Todos";
const DEFAULT_PAGE_SIZE = 25;

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

/**
 * Productos de la tienda: los publica el POS (Tienda → Productos), que es donde se crean, editan, se les
 * cambia precio, fotos e inventario y se ocultan. Aquí solo se consultan y se edita la capa web de cada uno
 * (Nueva colección, oferta manual, portada y SEO).
 */
export default function AdminProductos() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState(ALL_LABEL);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [editing, setEditing] = useState<ProductListItem | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchAdminProducts();
      setProducts(data.products);
      setCategories(data.categories);
    } catch (error) {
      setFetchError(
        error instanceof Error
          ? `No se pudieron leer los productos del POS: ${error.message}`
          : "No se pudieron leer los productos del POS"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredProducts = useMemo(() => {
    const q = normalize(search.trim());
    return products.filter(
      (p) =>
        (filterCategory === ALL_LABEL || p.categoryNames.includes(filterCategory)) &&
        (!q || normalize(p.name).includes(q) || p.slug.includes(q))
    );
  }, [products, search, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen font-sans">
      <ToastNotification toast={toast} />

      <AdminPageHeader
        title="Inventario"
        action={{ label: "Productos en el POS", href: posProductsUrl(), icon: ExternalLink }}
      />

      <div className="flex items-start gap-3 rounded-xl border border-[#154734]/20 bg-[#154734]/5 px-4 py-3 text-sm text-[#154734] -mt-4">
        <Info className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          Los productos, variantes, precios, fotos e inventario se administran en el POS (Tienda → Productos) y
          llegan solos a la tienda. Aquí solo se elige si van en Nueva colección, la oferta manual, la portada y el
          SEO. Más vendidos, Producto nuevo, Sugerido y la etiqueta de oferta del POS también se ponen en el POS.
        </p>
      </div>

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          {fetchError}
        </div>
      )}

      <ProductFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        filterCategory={filterCategory}
        onCategoryChange={(value) => {
          setFilterCategory(value);
          setPage(1);
        }}
        categories={categories.map((name) => ({ id: name, name }))}
      />

      <ProductTable products={paginatedProducts} loading={loading} onEdit={setEditing} />

      <AdminPagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        total={filteredProducts.length}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        itemLabel="productos"
      />

      {editing && (
        <PosProductModal
          product={editing}
          onClose={() => setEditing(null)}
          onSaved={async (message) => {
            showToast("success", message);
            setEditing(null);
            await load();
          }}
          onError={(message) => showToast("error", message)}
        />
      )}
    </div>
  );
}
