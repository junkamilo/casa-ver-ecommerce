import Link from "next/link";

interface CartFooterProps {
  subtotal: number;
  onClose: () => void;
}

const CartFooter = ({ subtotal, onClose }: CartFooterProps) => (
  <div className="p-5 border-t-2 border-accent bg-background">
    <div className="flex justify-between items-center mb-4 text-sm">
      <span className="text-foreground font-medium">Total estimado</span>
      <span className="text-xl font-bold text-primary">${subtotal.toLocaleString()} COP</span>
    </div>
    <p className="text-[10px] text-muted-foreground mb-4 text-center">
      Los impuestos y los gastos de envío se calculan en la página de pago.
    </p>
    <Link
      href="/checkout"
      onClick={onClose}
      className="block w-full gold-gradient text-white font-bold py-4 rounded text-center uppercase tracking-wider text-sm transition-all shadow-gold active:scale-[0.98]"
    >
      Pagar
    </Link>
  </div>
);

export default CartFooter;
