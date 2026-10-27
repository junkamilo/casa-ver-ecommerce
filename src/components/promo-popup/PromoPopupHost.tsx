"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import type {
  ActivePromoPopupDTO,
  PromoPopupPlacement,
} from "@/modules/posIntegration/contracts/pos-popups.schema";
import { useLaunchLockActive } from "@/hooks/use-launch-lock-gate";
import PromoPopupModal from "./PromoPopupModal";

const DISMISS_PREFIX = "cv_promo_popup_dismissed_";

/** Popup vigente de la ubicación (lo decide el POS: Diseño → Popups); `null` si no hay ninguno. */
async function fetchActivePromoPopup(placement: PromoPopupPlacement): Promise<ActivePromoPopupDTO | null> {
  const response = await fetch(`/api/promo-popups/active?placement=${placement}`);
  if (!response.ok) return null;
  const payload = (await response.json().catch(() => null)) as { data?: ActivePromoPopupDTO | null } | null;
  return payload?.data ?? null;
}

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

  const [popup, setPopup] = useState<ActivePromoPopupDTO | null>(null);
  const [visible, setVisible] = useState(false);
  const [checkoutSessionReady, setCheckoutSessionReady] = useState(false);

  const needsCheckoutGate = placement === "CHECKOUT" && authStatus !== "authenticated";

  useEffect(() => {
    if (!needsCheckoutGate) return;

    const check = () => {
      try {
        setCheckoutSessionReady(sessionStorage.getItem("cv_checkout_promo_ready") === "1");
      } catch {
        setCheckoutSessionReady(false);
      }
    };
    const t = setTimeout(check, 0);
    const id = setInterval(check, 400);
    return () => {
      clearTimeout(t);
      clearInterval(id);
    };
  }, [needsCheckoutGate]);

  const checkoutBlocked = needsCheckoutGate && !checkoutSessionReady;

  useEffect(() => {
    let cancelled = false;
    let showTimer: ReturnType<typeof setTimeout> | null = null;

    const reset = () => {
      if (!cancelled) {
        setVisible(false);
        setPopup(null);
      }
    };

    if (!placement || launchLockActive || checkoutBlocked) {
      queueMicrotask(reset);
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(reset);

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
  }, [placement, launchLockActive, checkoutBlocked, pathname]);

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
