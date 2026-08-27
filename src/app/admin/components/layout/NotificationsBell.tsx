"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  ArrowUpRight,
  PackageX,
  Palette,
  X,
} from "lucide-react";
import Link from "next/link";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
import AdminConfirmModal from "@/app/admin/components/AdminConfirmModal";
import { DeleteIcon, NotificationIcon } from "@/components/icons";
import { timeAgo } from "../../utils";
import type { StockAlertDTO as StockAlert } from "@/modules/adminCatalog/stockAlerts/contracts/stock-alert.dto";

interface AdminNotification {
  id: string;
  orderId: string | null;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

type PendingDelete =
  | { type: "all" }
  | { type: "one"; notification: AdminNotification };

const POLL_INTERVAL = 30_000;

export default function NotificationsBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [open, setOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [notifRes, stockRes] = await Promise.all([
        fetch("/api/admin/notifications", { cache: "no-store" }),
        fetch("/api/admin/stock-alerts", { cache: "no-store" }),
      ]);
      if (notifRes.ok) {
        const data = await notifRes.json();
        setUnreadCount(data.unreadCount);
        setNotifications(data.notifications);
      }
      if (stockRes.ok) {
        const data = await stockRes.json();
        setStockAlerts(data.alerts ?? []);
      }
    } catch {
      // silently ignore network errors
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { void fetchAll(); }, 0);
    const interval = setInterval(fetchAll, POLL_INTERVAL);
    return () => {
      clearTimeout(t);
      clearInterval(interval);
    };
  }, [fetchAll]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pendingDelete) setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, pendingDelete]);

  async function handleOpen() {
    if (open) {
      setOpen(false);
      setPendingDelete(null);
      return;
    }
    setOpen(true);
    if (unreadCount > 0) {
      try {
        await fetch("/api/admin/notifications/mark-read", { method: "POST" });
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch {
        // silently ignore
      }
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      if (pendingDelete.type === "all") {
        const res = await fetch("/api/admin/notifications", { method: "DELETE" });
        if (!res.ok) throw new Error("No se pudo eliminar el historial");
        setNotifications([]);
        setUnreadCount(0);
      } else {
        const id = pendingDelete.notification.id;
        const wasUnread = !pendingDelete.notification.isRead;
        const res = await fetch(`/api/admin/notifications/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("No se pudo eliminar la notificación");
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
      }
      setPendingDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  }

  const totalBadgeCount = unreadCount + stockAlerts.length;
  const hasOrderNotifications = notifications.length > 0;

  const modal = open ? (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (!pendingDelete) setOpen(false);
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-notifications-title"
    >
      <div
        className="bg-white w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[88vh] sm:max-h-[80vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <span className="w-10 h-1 rounded-full bg-gray-300" aria-hidden />
        </div>

        <div className="px-5 py-3.5 flex items-center justify-between gap-2 border-b border-gray-100 shrink-0">
          <span id="admin-notifications-title" className="text-base font-bold text-gray-900">
            Notificaciones
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              disabled={!hasOrderNotifications}
              onClick={() => setPendingDelete({ type: "all" })}
              className="group inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <DeleteIcon size={14} className="p-0.5 text-red-600 hover:bg-red-50 group-hover:bg-red-50 group-hover:text-red-700" />
              Eliminar historial
            </button>
            <Link
              href="/admin/pedidos"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-[#154734] flex items-center gap-0.5 hover:opacity-80 transition-opacity"
            >
              Ver pedidos <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-50 overflow-y-auto flex-1 min-h-0">
          {stockAlerts.length > 0 && (
            <>
              <div className="px-5 py-2.5 bg-red-50 flex items-center gap-2 sticky top-0">
                <PackageX className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                  Alertas de stock ({stockAlerts.length})
                </span>
              </div>

              {stockAlerts.map((alert, i) => (
                <div
                  key={`stock-${i}`}
                  className="flex items-start gap-3 px-5 py-3.5 bg-red-50/40 hover:bg-red-50/70 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    alert.type === "product" ? "bg-red-100" : "bg-orange-100"
                  }`}>
                    {alert.type === "product" ? (
                      <PackageX className="w-4 h-4 text-red-600" />
                    ) : (
                      <Palette className="w-4 h-4 text-orange-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">
                      {alert.type === "product" ? "Prenda agotada" : "Color agotado"}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {alert.type === "product"
                        ? alert.productName
                        : `${alert.productName} — ${alert.colorName}`}
                    </p>
                  </div>
                  <Link
                    href="/admin/productos"
                    onClick={() => setOpen(false)}
                    className="shrink-0 mt-0.5 text-xs font-bold text-red-500 hover:text-red-700 transition-colors whitespace-nowrap"
                  >
                    Ver →
                  </Link>
                </div>
              ))}
            </>
          )}

          {notifications.length > 0 && (
            <div className="px-5 py-2.5 bg-gray-50 flex items-center gap-2 sticky top-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                Pedidos
              </span>
            </div>
          )}

          {notifications.length === 0 && stockAlerts.length === 0 ? (
            <SectionEmptyState message="Sin notificaciones." />
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${
                  notif.isRead ? "bg-white" : "bg-emerald-50/40"
                }`}
              >
                <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 leading-snug">{notif.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{notif.body}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 mt-0.5">
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span className="whitespace-nowrap">{timeAgo(notif.createdAt)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPendingDelete({ type: "one", notification: notif })}
                    className="group rounded-lg"
                    aria-label="Eliminar notificación"
                  >
                    <DeleteIcon size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notificaciones"
        aria-expanded={open}
      >
        <NotificationIcon size={20} />
        {totalBadgeCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none shadow-sm">
            {totalBadgeCount > 9 ? "9+" : totalBadgeCount}
          </span>
        )}
      </button>
      {typeof document !== "undefined" ? createPortal(modal, document.body) : modal}
      <AdminConfirmModal
        open={pendingDelete !== null}
        title={pendingDelete?.type === "one" ? "Eliminar notificación" : "Eliminar historial"}
        description={
          pendingDelete?.type === "one"
            ? `Se eliminará “${pendingDelete.notification.title}”. El pedido no se borra.`
            : "Se eliminarán todas las notificaciones. Los pedidos y el historial de ventas no se tocan."
        }
        confirmLabel="Eliminar"
        variant="danger"
        loading={deleting}
        onConfirm={() => { void confirmDelete(); }}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </>
  );
}
