"use client";

// Re-export para preservar la API pública del hook (importado por
// src/app/checkout/page.tsx). La fuente única ahora vive en
// modules/checkout/presentation/hooks/use-auto-save-address.ts.
export { useAutoSaveAddress } from "@/modules/checkout/presentation/hooks/use-auto-save-address";
