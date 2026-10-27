"use client";

import {
  useLaunchLockActive,
  useLaunchLockGate,
} from "@/hooks/use-launch-lock-gate";
import LaunchCountdownModal from "./LaunchCountdownModal";

export default function LaunchLockWrapper() {
  const lockActive = useLaunchLockActive();
  if (!lockActive) return null;

  return <LaunchLockGate />;
}

function LaunchLockGate() {
  const { shouldShowModal } = useLaunchLockGate();

  if (!shouldShowModal) return null;

  return <LaunchCountdownModal />;
}
