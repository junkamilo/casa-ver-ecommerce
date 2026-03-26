import Link from "next/link";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId } = await searchParams;

  const order = orderId
    ? await prisma.order.findUnique({
        where: { id: orderId },
        select: { orderNumber: true, total: true, shippingName: true, status: true },
      })
    : null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 text-center">
        {/* Ícono */}
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-100">
          <CheckCircle2 className="w-10 h-10 text-green-500" strokeWidth={1.5} />
        </div>

        <h1
          className="text-3xl text-[#154734] mb-3"
          style={{ fontFamily: "Georgia, serif" }}
        >
          ¡Pedido confirmado!
        </h1>

        {order ? (
          <>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Gracias, <strong className="text-[#154734]">{order.shippingName}</strong>.{" "}
              {order.status === "PAID"
                ? "Tu pago fue procesado correctamente."
                : "Tu pedido fue recibido y está siendo procesado."}
            </p>
            <div className="bg-[#FAFAFA] border border-gray-100 rounded-2xl p-5 mb-8 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Número de orden</span>
                <span className="font-bold text-[#154734]">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total pagado</span>
                <span className="font-bold text-[#154734]">
                  ${Number(order.total).toLocaleString("es-CO")} COP
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estado</span>
                <span
                  className={`font-bold uppercase tracking-wider text-xs ${
                    order.status === "PAID" ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {order.status === "PAID" ? "Pagado" : "En proceso"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Tu pedido fue recibido. Recibirás un correo de confirmación en breve.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="w-full bg-[#154734] text-white text-sm font-bold uppercase tracking-[0.15em] py-4 rounded-xl hover:bg-[#C19A6B] transition-colors duration-300 flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            Seguir comprando
          </Link>
          <Link
            href="/perfil/pedidos"
            className="w-full border border-gray-200 text-[#154734] text-sm font-bold uppercase tracking-[0.15em] py-4 rounded-xl hover:border-[#154734] transition-colors duration-300 flex items-center justify-center gap-2"
          >
            Mis pedidos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
