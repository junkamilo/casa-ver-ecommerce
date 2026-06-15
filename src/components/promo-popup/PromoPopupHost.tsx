"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { fetchActivePromoPopup } from "@/modules/adminCatalog/promoPopups/presentation/api-client";
import type {
  ActivePromoPopupDTO,
  PromoPopupPlacement,
} from "@/modules/adminCatalog/promoPopups/contracts/promo-popup.dto";
import { useLaunchLockActive } from "@/hooks/use-launch-lock-gate";
import PromoPopupModal from "./PromoPopupModal";

const DISMISS_PREFIX = "cv_promo_popup_dismissed_";

function resolvePlacement(pathname: string): PromoPopupPlacement | null {
  if (pathname === "/") return "HOME";
  if (pathname === "/checkout") return "CHECKOUT";
  if (pathname.startsWith("/product/")) return "PRODUCT";
  return null;
}

function isDismissed(popupId: string): boolean {
  try {
    return localStorage.getItem(`${DISMISS_PREFIX}${popupId}`) === "1";
  } catch {
    return false;
  }
}

function dismissPopup(popupId: string) {
  try {
    localStorage.setItem(`${DISMISS_PREFIX}${popupId}`, "1");
  } catch {
    // localStorage no disponible
  }
}

export default function PromoPopupHost() {
  const pathname = usePathname() ?? "";
  const { status: authStatus } = useSession();
  const launchLockActive = useLaunchLockActive();

  const placement = useMemo(() => resolvePlacement(pathname), [pathname]);
  const isAdminRoute = pathname.startsWith("/admin");

  const [popup, setPopup] = useState<ActivePromoPopupDTO | null>(null);
  const [visible, setVisible] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);

  useEffect(() => {
    if (placement !== "CHECKOUT") {
      setCheckoutReady(true);
      return;
    }
    if (authStatus === "authenticated") {
      setCheckoutReady(true);
      return;
    }
    const check = () => {
      try {
        setCheckoutReady(sessionStorage.getItem("cv_checkout_promo_ready") === "1");
      } catch {
        setCheckoutReady(false);
      }
    };
    check();
    const id = setInterval(check, 400);
    return () => clearInterval(id);
  }, [placement, authStatus]);

  const checkoutBlocked = placement === "CHECKOUT" && !checkoutReady;

  useEffect(() => {
    setVisible(false);
    setPopup(null);

    if (!placement || isAdminRoute || launchLockActive || checkoutBlocked) {
      return;
    }

    let cancelled = false;
    let showTimer: ReturnType<typeof setTimeout> | null = null;

    const load = async () => {
      try {
        const active = await fetchActivePromoPopup(placement);
        if (cancelled || !active || isDismissed(active.id)) return;

        setPopup(active);
        showTimer = setTimeout(() => {
          if (!cancelled) setVisible(true);
        }, Math.max(0, active.delaySeconds) * 1000);
      } catch {
        // sin popup activo
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (showTimer) clearTimeout(showTimer);
    };
  }, [placement, isAdminRoute, launchLockActive, checkoutBlocked, pathname]);

  if (!visible || !popup) return null;

  return (
    <PromoPopupModal
      popup={popup}
      onClose={() => {
        dismissPopup(popup.id);
        setVisible(false);
      }}
    />
  );
}
