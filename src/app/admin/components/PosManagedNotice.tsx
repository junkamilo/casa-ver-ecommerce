import { Info } from "lucide-react";

/** Aviso de las pantallas que con el POS conectado son solo de consulta. */
export default function PosManagedNotice({ section }: { section: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#154734]/20 bg-[#154734]/5 px-4 py-3 text-sm text-[#154734]">
      <Info className="w-4 h-4 mt-0.5 shrink-0" />
      <p>
        Se administra en el POS (Configuraciones → {section}). Aquí solo se consulta: los cambios llegan
        solos cuando se guardan en el POS.
      </p>
    </div>
  );
}
