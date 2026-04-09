/**
 * Mensaje informativo cuando el pedido fue procesado con Addi.
 */
export default function AddiPendingInfo() {
  return (
    <div className="bg-[#00C2A8]/5 border border-[#00C2A8]/20 rounded-2xl p-6 mb-6 text-left">
      <p className="text-sm text-gray-600 leading-relaxed">
        Tu solicitud de crédito con{" "}
        <strong className="text-[#00C2A8]">Addi</strong> está siendo procesada.
        Recibirás un correo de confirmación cuando tu pedido sea aprobado.
      </p>
    </div>
  );
}
