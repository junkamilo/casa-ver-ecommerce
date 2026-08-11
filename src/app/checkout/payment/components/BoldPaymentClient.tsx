"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getPedidosHref } from "@/app/perfil/constants/pedidos-route";
import type { BoldPaymentClientProps } from "../types";

export default function BoldPaymentClient({
  orderRef,
  amount,
  integrity,
  orderId,
  customerEmail,
  customerName,
  customerPhone,
  customerDocument,
}: BoldPaymentClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const { status } = useSession();
  const pedidosHref = getPedidosHref(status === "authenticated");

  const identityKey = process.env.NEXT_PUBLIC_BOLD_IDENTITY_KEY;
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL;

  // Detectar si el usuario ya inició un pago (viene de vuelta después de ir a Bold)
  useEffect(() => {
    if (orderRef && sessionStorage.getItem(`bold_initiated_${orderRef}`)) {
      queueMicrotask(() => setPaymentInitiated(true));
    }
  }, [orderRef]);

  useEffect(() => {
    if (!containerRef.current || !orderRef || !amount || !integrity || !orderId || !identityKey) return;
    if (paymentInitiated) return;

    // Bold redirige al usuario a /pago/resultado donde el polling espera la confirmación
    // del webhook antes de mostrar la pantalla de éxito.
    // NO ir directo a /checkout/success — en ese momento la orden puede estar aún PENDING.
    const redirectionUrl = `${appUrl}/pago/resultado`;

    // Advertir al usuario si intenta cerrar/recargar antes de que Bold lo redirija
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    const script = document.createElement("script");
    script.src = "https://checkout.bold.co/library/boldPaymentButton.js";
    script.setAttribute("data-bold-button", "");
    script.setAttribute("data-api-key",        identityKey);
    script.setAttribute("data-order-id",       orderRef);
    script.setAttribute("data-amount",         amount);
    script.setAttribute("data-currency",       "COP");
    script.setAttribute("data-integrity",      integrity);
    script.setAttribute("data-description",    "Pedido Casa Verde");
    script.setAttribute("data-redirection-url", redirectionUrl);

    if (customerEmail || customerName || customerPhone || customerDocument) {
      const customerData: Record<string, string> = {};
      if (customerEmail) customerData.email = customerEmail;
      if (customerName) customerData.fullName = customerName;
      if (customerPhone) {
        customerData.phone = customerPhone.replace(/\D/g, "").slice(-10);
        customerData.dialCode = "+57";
      }
      if (customerDocument) {
        customerData.documentNumber = customerDocument;
        customerData.documentType = "CC";
      }
      script.setAttribute("data-customer-data", JSON.stringify(customerData));
    }

    const container = containerRef.current;
    container.appendChild(script);

    let clicked = false;

    const tryClick = () => {
      if (clicked) return;
      const btn = container.querySelector<HTMLElement>("button");
      if (btn) {
        clicked = true;
        // Marcar pago como iniciado ANTES de navegar a Bold
        sessionStorage.setItem(`bold_initiated_${orderRef}`, "1");
        // Quitar el beforeunload para no bloquear la redirección de Bold
        window.removeEventListener("beforeunload", handleBeforeUnload);
        btn.click();
      }
    };

    const observer = new MutationObserver(tryClick);
    observer.observe(container, { childList: true, subtree: true });

    const interval = setInterval(tryClick, 200);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      observer.disconnect();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      observer.disconnect();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [orderRef, amount, integrity, orderId, identityKey, appUrl, paymentInitiated, customerEmail, customerName, customerPhone, customerDocument]);

  if (!orderRef || !amount || !integrity || !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Parámetros de pago inválidos.</p>
      </div>
    );
  }

  // El usuario regresó después de haber iniciado el pago en Bold
  if (paymentInitiated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <p
            className="text-2xl text-[#154734] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Tu pago está en proceso
          </p>
          <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
            Detectamos que ya iniciaste un pago para este pedido. No es necesario
            volver a pagar. Tu pedido aparecerá en{" "}
            <strong>Mis pedidos</strong> tan pronto como se confirme.
          </p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href={`/pago/resultado?reference_id=${orderRef}`}
            className="w-full px-8 py-3 bg-[#154734] text-white rounded-full text-sm font-semibold text-center"
          >
            Verificar estado del pago
          </Link>
          <Link
            href={pedidosHref}
            className="w-full px-8 py-3 border border-[#154734] text-[#154734] rounded-full text-sm font-semibold text-center"
          >
            Ver mis pedidos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-6 px-4">
      {/* Loader visual mientras Bold inicializa */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#154734]/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#154734] animate-spin" />
        </div>
        <p
          className="text-2xl text-[#154734]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Abriendo pasarela de pago
        </p>
        <p className="text-sm text-gray-500 max-w-xs">
          Serás redirigido a Bold para completar tu compra de forma segura.
        </p>
        {/* Advertencia de no recargar */}
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 max-w-xs text-left mt-1">
          <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700">
            Por favor, no cierres ni actualices esta ventana mientras se
            procesa tu pago.
          </p>
        </div>
      </div>

      {/* Contenedor del botón Bold (el script lo renderiza aquí) */}
      <div ref={containerRef} className="flex justify-center" />

      {/* Fallback visible si el auto-click no funciona */}
      <p className="text-xs text-gray-400 mt-2">
        Si no eres redirigido automáticamente, haz clic en el botón que aparece arriba.
      </p>
    </div>
  );
}
