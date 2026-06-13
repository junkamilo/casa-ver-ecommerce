"use client";

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getPedidosHref } from "@/app/perfil/constants/pedidos-route";
import { BRAND_GREEN, BG_COLOR, FONT_SERIF, ROUTES } from "../constants";

export function TimeoutView() {
  const router = useRouter();
  const { status } = useSession();
  const pedidosHref = getPedidosHref(status === "authenticated");

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center"
      style={{ backgroundColor: BG_COLOR }}
    >
      <CheckCircle className="w-20 h-20 text-green-500" />
      <div>
        <h1 className="text-3xl mb-2" style={{ color: BRAND_GREEN, fontFamily: FONT_SERIF }}>
          ¡Tu pedido fue recibido!
        </h1>
        <p className="text-gray-600 max-w-sm">
          Tu compra está siendo procesada. Recibirás un correo de confirmación
          con los detalles de tu pedido en breve.
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href={pedidosHref}
          className="w-full px-8 py-3 text-white rounded-full text-sm font-semibold text-center"
          style={{ backgroundColor: BRAND_GREEN }}
        >
          Ver mis pedidos
        </Link>
        <button
          onClick={() => router.push(ROUTES.home)}
          className="w-full px-8 py-3 border rounded-full text-sm font-semibold transition-colors"
          style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
