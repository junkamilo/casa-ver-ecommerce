"use client";

import type { CSSProperties } from "react";
import { Copy } from "lucide-react";

export interface PromoPopupPreviewProps {
  headline: string;
  subtitle: string;
  couponCode: string;
  disclaimer: string;
  ctaText: string;
  onCopy?: () => void;
}

function PreviewLine({
  value,
  className,
  style,
  as: Tag = "span",
}: {
  value: string;
  className: string;
  style?: CSSProperties;
  as?: "span" | "p" | "h2";
}) {
  return (
    <Tag style={style} className={className}>
      {value}
    </Tag>
  );
}

export default function PromoPopupPreview({
  headline,
  subtitle,
  couponCode,
  disclaimer,
  ctaText,
  onCopy,
}: PromoPopupPreviewProps) {
  return (
    <div
      className="relative bg-white rounded-2xl border border-gray-200 shadow-sm max-w-sm mx-auto overflow-hidden"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="px-6 sm:px-8 pt-8 pb-6 text-center">
        <PreviewLine
          as="h2"
          value={headline}
          className="text-3xl sm:text-4xl font-bold text-[#154734] leading-tight block min-h-10"
          style={{ fontFamily: "Georgia, serif" }}
        />
        <PreviewLine
          as="p"
          value={subtitle}
          className="mt-2 text-lg sm:text-xl text-[#154734] block min-h-7"
          style={{ fontFamily: "Georgia, serif" }}
        />
        <div className="border-t border-gray-200 mt-5 mb-4" />
        <p className="text-sm text-gray-500 mb-3">Usa el código:</p>
        <div className="flex items-center justify-center gap-2 rounded-lg px-4 py-3.5 mx-auto max-w-xs bg-[#154734] text-white">
          <span className="font-mono font-bold tracking-widest text-sm sm:text-base break-all">
            {couponCode}
          </span>
          {onCopy ? (
            <button
              type="button"
              onClick={onCopy}
              className="p-1.5 rounded-md hover:bg-white/10 transition-colors shrink-0"
              title="Copiar código"
              aria-label="Copiar código"
            >
              <Copy className="w-4 h-4" />
            </button>
          ) : null}
        </div>
        <PreviewLine
          as="p"
          value={disclaimer}
          className="text-xs text-gray-400 mt-4 mb-5 block min-h-4"
        />
        <div className="w-full bg-[#154734] text-white text-sm font-black uppercase tracking-[0.15em] py-3.5 rounded-lg min-h-12 flex items-center justify-center">
          {ctaText}
        </div>
      </div>
    </div>
  );
}
