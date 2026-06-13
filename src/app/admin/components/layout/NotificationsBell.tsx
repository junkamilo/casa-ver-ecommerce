"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Bell, CheckCircle2, Clock, ArrowUpRight, PackageX, Palette } from "lucide-react";
import Link from "next/link";
import SectionEmptyState from "@/components/ui/SectionEmptyState";
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

const POLL_INTERVAL = 30_000;

export default function NotificationsBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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
    fetchAll();
    const interval = setInterval(fetchAll, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAll]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleOpen() {
    if (open) { setOpen(false); return; }
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

  const totalBadgeCount = unreadCount + stockAlerts.length;

  return (
    <div className="relative" ref={panelRef}>
      {/* Botón campana */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5" />
        {totalBadgeCount > 0 && (
          <span className={`absolute top-0.5 right-0.5 min-w-[18px] h-[18px] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none shadow-sm ${
            stockAlerts.length > 0 ? "bg-red-500" : "bg-red-500"
          }`}>
            {totalBadgeCount > 9 ? "9+" : totalBadgeCount}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 isolate overflow-hidden">

          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <span className="text-sm font-bold text-gray-900">Notificaciones</span>
            <Link
              href="/admin/pedidos"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-[#154734] flex items-center gap-0.5 hover:opacity-80 transition-opacity"
            >
              Ver pedidos <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-50 max-h-[460px] overflow-y-auto">

            {/* ── Alertas de stock ─────────────────────────── */}
            {stockAlerts.length > 0 && (
              <>
                <div className="px-4 py-2 bg-red-50 flex items-center gap-2">
                  <PackageX className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                    Alertas de stock ({stockAlerts.length})
                  </span>
                </div>

                {stockAlerts.map((alert, i) => (
                  <div
                    key={`stock-${i}`}
                    className="flex items-start gap-3 px-4 py-3 bg-red-50/40 hover:bg-red-50/70 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.type === "product" ? "bg-red-100" : "bg-orange-100"
                    }`}>
                      {alert.type === "product" ? (
                        <PackageX className="w-4 h-4 text-red-600" />
                      ) : (
                        <Palette className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 leading-snug">
                        {alert.type === "product" ? "Prenda agotada" : "Color agotado"}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        {alert.type === "product"
                          ? alert.productName
                          : `${alert.productName} — ${alert.colorName}`}
                      </p>
                    </div>
                    <Link
                      href="/admin/productos"
                      onClick={() => setOpen(false)}
                      className="shrink-0 mt-0.5 text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors whitespace-nowrap"
                    >
                      Ver →
                    </Link>
                  </div>
                ))}
              </>
            )}

            {/* ── Notificaciones de pedidos ─────────────────── */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 flex items-center gap-2">
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
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                    notif.isRead ? "bg-white" : "bg-emerald-50/40"
                  }`}
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 leading-snug">{notif.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{notif.body}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-[10px] text-gray-400 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span className="whitespace-nowrap">{timeAgo(notif.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
