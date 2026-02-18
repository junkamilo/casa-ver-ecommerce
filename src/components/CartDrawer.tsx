"use client";

import { X, Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext"; // Usamos nuestro hook

const CartDrawer = () => {
  // Traemos todo del contexto
  const { isCartOpen, closeCart, items, removeFromCart, updateQuantity, subtotal, cartCount } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay oscuro */}
      <div
        className="absolute inset-0 bg-black/40 animate-in fade-in duration-300"
        onClick={closeCart}
      />

      {/* Panel Blanco */}
      <div className="relative w-full max-w-[420px] bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

        {/* 1. Header del Carrito */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Carrito
            <span className="bg-muted text-foreground text-xs px-2 py-0.5 rounded-full border border-border">
              {cartCount}
            </span>
          </h2>
          <button onClick={closeCart} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Lista de Productos */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <ShoppingBag className="w-12 h-12 mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">Tu carrito está vacío</p>
              <button onClick={closeCart} className="mt-4 text-sm underline hover:text-brand">Seguir comprando</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4">
                {/* Imagen */}
                <div className="relative w-24 h-32 flex-shrink-0 bg-muted rounded overflow-hidden border border-border/50">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                {/* Detalles */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-bold text-foreground line-clamp-2 pr-2">{item.name}</h3>
                      <span className="text-sm font-semibold">${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {item.color} {item.size ? `· ${item.size}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">${item.price.toLocaleString()}</p>
                  </div>

                  {/* Controles: Cantidad y Eliminar */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-border rounded h-8 w-24">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-full flex items-center justify-center hover:bg-muted"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="flex-1 text-center text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-full flex items-center justify-center hover:bg-muted"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 3. Footer de Totales */}
        {items.length > 0 && (
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
              onClick={closeCart}
              className="block w-full gold-gradient text-white font-bold py-4 rounded text-center uppercase tracking-wider text-sm transition-all shadow-gold active:scale-[0.98]"
            >
              Pagar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
