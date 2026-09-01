"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type UploadProgressOverlayProps = {
  open: boolean;
  message: string;
  submessage?: string;
  progress?: number | null;
  progressLabel?: string;
  variant?: "inline" | "fullscreen";
  className?: string;
};

function ProgressBar({
  progress,
  indeterminate,
}: {
  progress?: number | null;
  indeterminate: boolean;
}) {
  if (indeterminate) {
    return (
      <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
        <div className="h-full w-1/3 rounded-full bg-white/90 animate-[upload-indeterminate_1.2s_ease-in-out_infinite]" />
      </div>
    );
  }

  const pct = Math.min(100, Math.max(0, progress ?? 0));
  return (
    <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
      <div
        className="h-full rounded-full bg-white/90 transition-[width] duration-300 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function UploadProgressOverlay({
  open,
  message,
  submessage,
  progress,
  progressLabel,
  variant = "inline",
  className,
}: UploadProgressOverlayProps) {
  if (!open) return null;

  const indeterminate = progress == null;
  const showPct = !indeterminate && progress != null;

  const content = (
    <div className="flex flex-col items-center gap-3 text-center px-4 max-w-xs">
      <Loader2 className="w-7 h-7 animate-spin shrink-0" />
      <div className="space-y-1">
        <p className="text-sm font-semibold leading-snug">{message}</p>
        {submessage ? (
          <p className="text-[11px] opacity-80 leading-snug">{submessage}</p>
        ) : null}
      </div>
      <div className="w-full space-y-1">
        <ProgressBar progress={progress} indeterminate={indeterminate} />
        <div className="flex justify-between text-[10px] opacity-75 tabular-nums">
          <span>{progressLabel ?? ""}</span>
          {showPct ? <span>{Math.round(progress)}%</span> : null}
        </div>
      </div>
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div
        className={cn(
          "fixed inset-0 z-[80] flex items-center justify-center bg-black/55 backdrop-blur-[1px] text-white",
          className,
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/50 text-white",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {content}
    </div>
  );
}
