"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { UserProfile, ToastState, UseProfileResult } from "../types";

export function useProfile(): UseProfileResult {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const redirectToLogin = useCallback(() => {
    const query = searchParams.toString();
    const returnTo = query ? `${pathname}?${query}` : pathname;
    router.replace(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }, [pathname, router, searchParams]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") redirectToLogin();
  }, [status, redirectToLogin]);

  // Collapse sidebar on mobile by default
  useEffect(() => {
    if (window.innerWidth < 768) {
      queueMicrotask(() => setIsSidebarOpen(false));
    }
  }, []);

  // Fetch profile once authenticated
  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setFetchError(null);
    });
    fetch("/api/profile")
      .then(async (res) => {
        if (res.status === 401) {
          redirectToLogin();
          throw new Error("Sesión expirada");
        }
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `Error ${res.status}`);
        }
        return res.json();
      })
      .then((data: UserProfile) => setProfile(data))
      .catch((err: unknown) => {
        if (err instanceof Error && err.message === "Sesión expirada") return;
        const msg = err instanceof Error ? err.message : "Error al cargar el perfil";
        setFetchError(msg);
      })
      .finally(() => setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [status, redirectToLogin]);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);
  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  return {
    profile,
    setProfile,
    loading,
    fetchError,
    toast,
    showToast,
    dismissToast,
    isSidebarOpen,
    openSidebar,
    toggleSidebar,
  };
}
