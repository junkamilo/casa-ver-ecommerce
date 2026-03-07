import Link from "next/link";
import { Clock, MessageCircle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CopyOrderButton from "./CopyOrderButton";

interface PendingPageProps {
  searchParams: Promise<{ orderId?: string; method?: string }>;
}

const BANK_INFO: Record<string, { name: string; detail: string; color: string }> = {
  NEQUI:       { name: "Nequi",       detail: "Número: 300 123 4567",                 color: "text-[#6C1D8E]" },
  BANCOLOMBIA: { name: "Bancolombia", detail: "Cuenta Ahorros: 123-456789-00",        color: "text-[#8B6914]" },
  DAVIPLATA:   { name: "Daviplata",   detail: "Número: 300 987 6543",                  color: "text-red-600" },
  ADDI:        { name: "Addi",        detail: "Pronto recibirás un enlace de Addi",   color: "text-[#00C2A8]" },
};

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "573001234567";

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 text-center">
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
            <strong className="text-[#154734]">{order.orderNumber}</strong> está esperando confirmación de pago.
          </p>
        )}

        {/* Instrucciones de pago */}
        {bank && method !== "ADDI" && (
          <div className="bg-[#FAFAFA] border border-gray-100 rounded-2xl p-6 mb-6 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">
              Datos de transferencia
            </p>
            <p className={`text-lg font-bold mb-1 ${bank.color}`}>{bank.name}</p>
            <p className="text-sm text-gray-600 mb-4">{bank.detail}</p>

            {order && (
              <div className="flex justify-between text-sm border-t border-gray-100 pt-4">
                <span className="text-gray-500">Monto a transferir</span>
                <span className="font-bold text-[#154734]">
                  ${Number(order.total).toLocaleString("es-CO")} COP
                </span>
              </div>
            )}

            {order && <CopyOrderButton orderNumber={order.orderNumber} />}
          </div>
        )}

        {method === "ADDI" && (
          <div className="bg-[#00C2A8]/5 border border-[#00C2A8]/20 rounded-2xl p-6 mb-6 text-left">
            <p className="text-sm text-gray-600 leading-relaxed">
              Recibirás un enlace de <strong className="text-[#00C2A8]">Addi</strong> por correo electrónico para completar tu pago a cuotas.
            </p>
          </div>
        )}

        {/* Botón WhatsApp (solo para transferencias manuales) */}
        {bank && method !== "ADDI" && (
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
