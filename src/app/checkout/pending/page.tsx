import Link from "next/link";
import { Clock, MessageCircle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import BankTransferInfo from "./components/BankTransferInfo";
import AddiPendingInfo from "./components/AddiPendingInfo";
import { BANK_INFO, WHATSAPP_NUMBER } from "./constants";

interface PendingPageProps {
  searchParams: Promise<{ orderId?: string; method?: string }>;
}

export default async function CheckoutPendingPage({ searchParams }: PendingPageProps) {
  const { orderId, method } = await searchParams;

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        select: { orderNumber: true, total: true, shippingName: true },
      })
    : null;

  const bank = method ? BANK_INFO[method] : null;

  const whatsappMessage = order
    ? encodeURIComponent(
        `Hola Casa Verde! Adjunto comprobante de pago para el pedido ${order.orderNumber} por $${Number(order.total).toLocaleString("es-CO")} COP.`
      )
    : encodeURIComponent("Hola Casa Verde! Adjunto comprobante de pago.");

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;
  const isManualTransfer = bank && method !== "ADDI";

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-4xl p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 text-center">
        {/* Ícono */}
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-amber-100">
          <Clock className="w-10 h-10 text-amber-500" strokeWidth={1.5} />
        </div>

        <h1
          className="text-3xl text-[#154734] mb-3"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Pedido pendiente
        </h1>

        {order && (
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Gracias, <strong className="text-[#154734]">{order.shippingName}</strong>. Tu pedido{" "}
            <strong className="text-[#154734]">{order.orderNumber}</strong> está esperando
            confirmación de pago.
          </p>
        )}

        {/* Instrucciones de pago */}
        {isManualTransfer && <BankTransferInfo bank={bank} order={order} />}
        {method === "ADDI" && <AddiPendingInfo />}

        {/* Botón WhatsApp — solo transferencias manuales */}
        {isManualTransfer && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] text-white text-sm font-bold uppercase tracking-[0.15em] py-4 rounded-xl hover:bg-[#1DA851] transition-colors duration-300 flex items-center justify-center gap-2 mb-3"
          >
            <MessageCircle className="w-4 h-4" />
            Enviar comprobante por WhatsApp
          </a>
        )}

        <Link
          href="/"
          className="w-full border border-gray-200 text-[#154734] text-sm font-bold uppercase tracking-[0.15em] py-4 rounded-xl hover:border-[#154734] transition-colors duration-300 flex items-center justify-center gap-2"
        >
          Volver a la tienda
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
