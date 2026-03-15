"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface BoldPaymentClientProps {
  orderRef: string;
  amount: string;
  integrity: string;
  orderId: string;
}

export default function BoldPaymentClient({ orderRef, amount, integrity, orderId }: BoldPaymentClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const identityKey = process.env.NEXT_PUBLIC_BOLD_IDENTITY_KEY;
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL;

  useEffect(() => {
    if (!containerRef.current || !orderRef || !amount || !integrity || !orderId || !identityKey) return;

    const redirectionUrl = `${appUrl}/checkout/success?orderId=${orderId}`;

    // ── Logs diagnósticos Bold ─────────────────────────────────────────────
    console.log('[BOLD CREATE] ===== INICIANDO BOTÓN BOLD =====');
    console.log('[BOLD CREATE] URL usada:', 'https://checkout.bold.co/library/boldPaymentButton.js');
    console.log('[BOLD CREATE] Headers enviados:', JSON.stringify({
      'data-api-key': identityKey,
      'data-order-id': orderRef,
      'data-amount': amount,
      'data-currency': 'COP',
      'data-integrity': integrity,
      'data-redirection-url': redirectionUrl,
    }));
    console.log('[BOLD CREATE] Body enviado:', JSON.stringify({
      apiKey: identityKey,
      orderId: orderRef,
      amount,
      currency: 'COP',
      integrity,
      redirectionUrl,
    }, null, 2));
    // ──────────────────────────────────────────────────────────────────────

    // Bold requiere un <script data-bold-button ...> con todos los atributos
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

    const container = containerRef.current;
    container.appendChild(script);

    // Intentar hacer click tan pronto como el botón aparezca en el DOM
    // MutationObserver es más confiable que setTimeout fijo
    let clicked = false;

    const tryClick = () => {
      if (clicked) return;
      const btn = container.querySelector<HTMLElement>("button");
      if (btn) {
        clicked = true;
        btn.click();
      }
    };

    const observer = new MutationObserver(tryClick);
    observer.observe(container, { childList: true, subtree: true });

    // Fallback: intentar cada 200ms hasta 5 segundos
    const interval = setInterval(() => {
      tryClick();
    }, 200);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      observer.disconnect();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [orderRef, amount, integrity, orderId, identityKey, appUrl]);

  if (!orderRef || !amount || !integrity || !orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Parámetros de pago inválidos.</p>
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
