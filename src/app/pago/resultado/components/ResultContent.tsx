"use client";

import { MAX_POLL_ATTEMPTS } from "../constants";
import { usePaymentVerification } from "../hooks/usePaymentVerification";
import { ApprovedView } from "./ApprovedView";
import { LoadingView } from "./LoadingView";
import { RejectedView } from "./RejectedView";
import { TimeoutView } from "./TimeoutView";

export function ResultContent() {
  const { status, orderId, pollCount } = usePaymentVerification();

  if (status === "loading" || (status === "RUNNING" && pollCount < MAX_POLL_ATTEMPTS)) {
    return <LoadingView isRunning={status === "RUNNING"} />;
  }

  if (status === "APPROVED") {
    return <ApprovedView orderId={orderId} />;
  }

  if (status === "REJECTED") {
    return <RejectedView />;
  }

  // error o timeout (RUNNING agotó MAX_POLL_ATTEMPTS)
  return <TimeoutView />;
}
