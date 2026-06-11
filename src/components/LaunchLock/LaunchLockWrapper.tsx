"use client";

import {
  useLaunchLockActive,
  useLaunchLockGate,
} from "@/hooks/use-launch-lock-gate";
import LaunchCountdownModal from "./LaunchCountdownModal";
import LaunchLockSkeleton from "./LaunchLockSkeleton";

export default function LaunchLockWrapper() {
  const lockActive = useLaunchLockActive();
  if (!lockActive) return null;

  return <LaunchLockGate />;
}

function LaunchLockGate() {
  const { isResolvingSession, shouldShowModal } = useLaunchLockGate();

  if (isResolvingSession) return <LaunchLockSkeleton />;
  if (!shouldShowModal) return null;

  return <LaunchCountdownModal />;
}
