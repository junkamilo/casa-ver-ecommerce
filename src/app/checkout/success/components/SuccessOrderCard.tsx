interface SuccessOrder {
  orderNumber: string;
  total: unknown;
  shippingName: string;
  status: string;
}

interface SuccessOrderCardProps {
  order: SuccessOrder;
}

/**
 * Tarjeta con el resumen del pedido confirmado: número, total y estado.
 */
export default function SuccessOrderCard({ order }: SuccessOrderCardProps) {
  const isPaid = order.status === "PAID";

  return (
    <>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        Gracias, <strong className="text-[#154734]">{order.shippingName}</strong>.{" "}
        {isPaid
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
              isPaid ? "text-green-600" : "text-amber-600"
            }`}
          >
            {isPaid ? "Pagado" : "En proceso"}
          </span>
        </div>
      </div>
    </>
  );
}
