import CopyOrderButton from "./CopyOrderButton";
import type { BankInfo, PendingOrder } from "../types";

interface BankTransferInfoProps {
  bank: BankInfo;
  order: PendingOrder | null;
}

/**
 * Muestra los datos de transferencia bancaria (Nequi, Bancolombia, Daviplata)
 * y el botón para copiar el número de orden como referencia de pago.
 */
export default function BankTransferInfo({ bank, order }: BankTransferInfoProps) {
  return (
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
  );
}
