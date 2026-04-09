"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { PaymentStatus, VerifyResult } from "../types";
import {
  BOLD_VERIFY_ENDPOINT,
  MAX_POLL_ATTEMPTS,
  POLL_INTERVAL_MS,
  QUERY_PARAMS,
  ROUTES,
} from "../constants";

async function fetchVerifyPayment(referenceId: string): Promise<VerifyResult> {
  try {
    const res = await fetch(
      `${BOLD_VERIFY_ENDPOINT}?reference_id=${encodeURIComponent(referenceId)}`
    );
    const data = await res.json();
    const s = (data.status ?? "UNKNOWN").toUpperCase();
    if (s === "APPROVED") return { status: "APPROVED", orderId: data.orderId };
    if (s === "REJECTED" || s === "CANCELLED" || s === "EXPIRED") return { status: "REJECTED" };
    return { status: "RUNNING" };
  } catch {
    return { status: "error" };
  }
}

export interface UsePaymentVerificationReturn {
  status: PaymentStatus;
  orderId: string | undefined;
  pollCount: number;
}

export function usePaymentVerification(): UsePaymentVerificationReturn {
  const params = useSearchParams();
  const router = useRouter();

  // Bold Botón de Pagos envía: ?bold-order-id=...&bold-tx-status=...
  const referenceId =
    params.get(QUERY_PARAMS.boldOrderId) ??
    params.get(QUERY_PARAMS.referenceId) ??
    params.get(QUERY_PARAMS.reference) ??
    params.get(QUERY_PARAMS.ref) ??
    null;

  const boldTxStatus = params.get(QUERY_PARAMS.boldTxStatus);

  const [status, setStatus] = useState<PaymentStatus>("loading");
  const [orderId, setOrderId] = useState<string | undefined>();
  const [pollCount, setPollCount] = useState(0);

  // Verificación inicial al montar
  useEffect(() => {
    if (!referenceId) {
      setStatus("error");
      return;
    }
    // Si Bold ya confirmó rechazo, no llamamos al API
    if (boldTxStatus === "rejected") {
      setStatus("REJECTED");
      return;
    }
    fetchVerifyPayment(referenceId).then((result) => {
      setStatus(result.status);
      if (result.orderId) setOrderId(result.orderId);
      if (result.status === "APPROVED" && result.orderId) {
        router.replace(ROUTES.success(result.orderId));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceId]);

  // Polling mientras RUNNING (máx MAX_POLL_ATTEMPTS intentos)
  useEffect(() => {
    if (status !== "RUNNING" || pollCount >= MAX_POLL_ATTEMPTS || !referenceId) return;

    const timer = setTimeout(async () => {
      const result = await fetchVerifyPayment(referenceId);
      setStatus(result.status);
      if (result.orderId) setOrderId(result.orderId);
      setPollCount((c) => c + 1);
      if (result.status === "APPROVED" && result.orderId) {
        router.replace(ROUTES.success(result.orderId));
      }
    }, POLL_INTERVAL_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pollCount]);

  return { status, orderId, pollCount };
}
