import Image from "next/image";
import Link from "next/link";
import type { SetComponentDTO } from "@/modules/catalog/product/contracts/product-detail.dto";
import { formatPrice } from "../constants";

/** Piezas de un conjunto del POS: cada una enlaza a su ficha si el POS la publica sola. */
export default function SetComponents({ components }: { components: SetComponentDTO[] }) {
  if (components.length === 0) return null;
  return (
    <section className="mt-6 space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[color:var(--theme-primary)]">Este conjunto incluye</p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {components.map((piece) => {
          const content = (
            <>
              <div className="relative w-12 h-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {piece.imageUrl ? (
                  <Image src={piece.imageUrl} alt={piece.name} fill sizes="48px" className="object-cover" />
                ) : null}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{piece.name}</p>
                <p className="text-xs text-gray-500">{formatPrice(piece.price)}</p>
              </div>
            </>
          );
          return (
            <li key={`${piece.position}-${piece.name}`}>
              {piece.slug ? (
                <Link
                  href={`/product/${piece.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-gray-100 p-2 hover:border-[color:var(--theme-accent)]/50 transition-colors"
                >
                  {content}
                </Link>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-gray-100 p-2">{content}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
