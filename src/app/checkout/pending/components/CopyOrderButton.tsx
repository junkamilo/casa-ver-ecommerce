"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CopyOrderButton({ orderNumber }: { orderNumber: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="mt-4 w-full flex items-center justify-center gap-2 text-xs text-gray-500 border border-gray-200 rounded-xl py-2.5 hover:border-[#154734] hover:text-[#154734] transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copiado" : "Copiar número de orden como referencia"}
    </button>
  );
}
