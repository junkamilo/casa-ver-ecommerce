import { CreditCard } from "lucide-react";
import type { PaymentMethodSale } from "../types/types";

const METHOD_COLORS: Record<string, string> = {
  BOLD:        "bg-[#154734]",
  ADDI:        "bg-[#C19A6B]",
  NEQUI:       "bg-purple-500",
  BANCOLOMBIA: "bg-yellow-500",
  DAVIPLATA:   "bg-red-500",
};

interface Props {
  data: PaymentMethodSale[];
}

export function PaymentMethodsChart({ data }: Props) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2 mb-4 sm:mb-6">
        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#C19A6B]" />
        Métodos de Pago
      </h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-gray-400">
          <p className="text-sm">Sin datos para este período</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((method) => (
            <div key={method.method}>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${METHOD_COLORS[method.method] ?? "bg-gray-400"}`} />
                  <span className="font-semibold text-gray-800">{method.label}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="font-bold text-gray-700">{method.revenue}</span>
                  <span className="bg-gray-100 px-1.5 py-0.5 rounded font-medium">{method.orders} ped.</span>
                  <span className="font-bold text-[#154734] w-8 text-right">{method.percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${METHOD_COLORS[method.method] ?? "bg-gray-400"}`}
                  style={{ width: `${method.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
