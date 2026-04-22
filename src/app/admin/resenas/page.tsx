"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, Trash2, Search, Star, Clock, RefreshCw } from "lucide-react";
import AdminPageHeader from "@/components/ui/AdminPageHeader";

type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

interface AdminReview {
  id: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  guestName: string | null;
  user: { name: string | null; email: string | null } | null;
  product: { id: string; name: string; slug: string };
  order: { orderNumber: string };
}

const STATUS_LABELS: Record<ReviewStatus | "ALL", string> = {
  ALL:      "Todas",
  PENDING:  "Pendientes",
  APPROVED: "Aprobadas",
  REJECTED: "Rechazadas",
};

const STATUS_STYLES: Record<ReviewStatus, string> = {
  PENDING:  "bg-yellow-50 text-yellow-700 border-yellow-200",
  APPROVED: "bg-green-50 text-green-700 border-green-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminResenas() {
  const [reviews, setReviews]       = useState<AdminReview[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "ALL">("PENDING");
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast]           = useState<{ msg: string; ok: boolean } | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        search,
        page: String(page),
      });
      const res  = await fetch(`/api/admin/reviews?${params}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      setReviews(data.reviews ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error("[Admin/Resenas]", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function changeStatus(id: string, status: ReviewStatus) {
    setActionLoading(id + status);
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setActionLoading(null);
    if (data.success) {
      showToast(
        status === "APPROVED" ? "Reseña aprobada ✓" : status === "REJECTED" ? "Reseña rechazada" : "Estado actualizado",
        true
      );
      fetchReviews();
    } else {
      showToast("Error al actualizar", false);
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("¿Eliminar esta reseña permanentemente?")) return;
    setActionLoading(id + "delete");
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    const data = await res.json();
    setActionLoading(null);
    if (data.success) {
      showToast("Reseña eliminada", true);
      fetchReviews();
    } else {
      showToast("Error al eliminar", false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  const reviewerName = (r: AdminReview) => r.user?.name || r.guestName || "Cliente";

  return (
    <div className="min-h-screen bg-[#FAFAF8] p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        <AdminPageHeader title="Reseñas de Clientes" />

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 transition-all ${
            toast.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {toast.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {toast.msg}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Status tabs */}
            <div className="flex gap-1 flex-wrap">
              {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    statusFilter === s
                      ? "bg-[#154734] text-white shadow-sm"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Buscar reseña..."
                  className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#154734]/20 focus:border-[#154734] w-48"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 bg-[#154734] text-white rounded-xl hover:bg-[#154734]/90 transition"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
                className="px-3 py-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition"
                title="Limpiar"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Stats summary */}
        <p className="text-xs text-gray-500 px-1">
          {total} reseña{total !== 1 ? "s" : ""} encontrada{total !== 1 ? "s" : ""}
        </p>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Cargando reseñas...
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <Star className="w-8 h-8 mb-3 opacity-30" />
              <p className="text-sm">No hay reseñas en esta categoría</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-auto max-h-150">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-[#F8F9FA]">
                      <th className="sticky top-0 z-20 bg-[#F8F9FA] text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 shadow-[0_1px_0_0_rgba(229,231,235,1)]">Cliente</th>
                      <th className="sticky top-0 z-20 bg-[#F8F9FA] text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 shadow-[0_1px_0_0_rgba(229,231,235,1)]">Prenda</th>
                      <th className="sticky top-0 z-20 bg-[#F8F9FA] text-left px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 shadow-[0_1px_0_0_rgba(229,231,235,1)]">Reseña</th>
                      <th className="sticky top-0 z-20 bg-[#F8F9FA] text-center px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 shadow-[0_1px_0_0_rgba(229,231,235,1)]">Estado</th>
                      <th className="sticky top-0 z-20 bg-[#F8F9FA] text-right px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500 shadow-[0_1px_0_0_rgba(229,231,235,1)]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {reviews.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-4 align-top">
                          <p className="font-semibold text-[#154734] text-xs">{reviewerName(r)}</p>
                          {r.user?.email && (
                            <p className="text-[11px] text-gray-400">{r.user.email}</p>
                          )}
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Pedido #{r.order.orderNumber}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top max-w-[160px]">
                          <p className="text-xs font-medium text-gray-700 leading-snug line-clamp-2">{r.product.name}</p>
                        </td>
                        <td className="px-5 py-4 align-top max-w-[280px]">
                          <div className="flex gap-0.5 mb-1.5">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-[#C19A6B] text-[#C19A6B]" : "fill-gray-200 text-gray-200"}`} />
                            ))}
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 italic">
                            &ldquo;{r.comment}&rdquo;
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(r.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </td>
                        <td className="px-5 py-4 align-top text-center">
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_STYLES[r.status]}`}>
                            {STATUS_LABELS[r.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-top">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.status !== "APPROVED" && (
                              <button
                                onClick={() => changeStatus(r.id, "APPROVED")}
                                disabled={actionLoading !== null}
                                title="Aprobar"
                                className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition disabled:opacity-50"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {r.status !== "REJECTED" && (
                              <button
                                onClick={() => changeStatus(r.id, "REJECTED")}
                                disabled={actionLoading !== null}
                                title="Rechazar"
                                className="p-1.5 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteReview(r.id)}
                              disabled={actionLoading !== null}
                              title="Eliminar"
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#154734]">{reviewerName(r)}</p>
                        <p className="text-xs text-gray-400">Pedido #{r.order.orderNumber}</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">{r.product.name}</p>
                      </div>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-[#C19A6B] text-[#C19A6B]" : "fill-gray-200 text-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-600 italic leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                    <div className="flex gap-2 pt-1">
                      {r.status !== "APPROVED" && (
                        <button onClick={() => changeStatus(r.id, "APPROVED")} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition">
                          <CheckCircle className="w-3.5 h-3.5" /> Aprobar
                        </button>
                      )}
                      {r.status !== "REJECTED" && (
                        <button onClick={() => changeStatus(r.id, "REJECTED")} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-semibold hover:bg-yellow-100 transition">
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      )}
                      <button onClick={() => deleteReview(r.id)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm text-gray-500">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-600 disabled:opacity-40 hover:bg-gray-50 transition"
            >
              Siguiente
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
