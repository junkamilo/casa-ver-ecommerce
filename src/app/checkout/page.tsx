"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronRight, ShoppingBag, ShieldCheck, ArrowLeft, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const shippingCost = 18000;
  const total = subtotal + shippingCost;

  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col lg:flex-row font-sans selection:bg-[#C19A6B]/20">
      
      {/* --- MOBILE RESUMEN COLLAPSABLE --- */}
      <div className="lg:hidden bg-white border-b border-gray-100 px-4 sm:px-8 py-6 z-20 sticky top-0 shadow-sm">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer list-none">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] text-[#154734] flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-[#C19A6B]" />
              Resumen del pedido
              <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
            </span>
            <span className="text-lg font-bold text-[#154734]">${total.toLocaleString()}</span>
          </summary>
          <div className="mt-6 space-y-5">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="relative w-16 h-16 rounded-xl border border-gray-100 bg-[#FAFAFA] overflow-hidden shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                  <span className="absolute top-0 right-0 bg-[#154734] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-bl-xl z-10">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-[#154734] uppercase tracking-wide truncate">{item.name}</p>
                  <p className="text-[11px] text-gray-500 uppercase tracking-widest">{item.color}</p>
                </div>
                <span className="text-sm font-medium text-gray-600 shrink-0">
                  ${(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-100 space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium text-gray-700">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Envío</span>
                <span className="font-medium text-gray-700">${shippingCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* --- COLUMNA IZQUIERDA (FORMULARIO) --- */}
      <div className="flex-1 lg:w-[55%] flex flex-col px-4 sm:px-8 lg:px-16 xl:px-24 pt-8 lg:pt-16 pb-20 bg-white shadow-[10px_0_40px_rgba(0,0,0,0.02)] z-10">
        
        {/* Header Premium */}
        <header className="mb-10 flex items-center justify-center lg:justify-start relative">
          <Link href="/" className="absolute left-0 hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-gray-100 hover:bg-[#FAFAFA] hover:scale-105 transition-all duration-300 group">
            <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-[#154734] transition-colors" />
          </Link>
          <Link href="/" className="text-3xl sm:text-4xl text-[#154734] tracking-tight leading-none" style={{ fontFamily: "Georgia, serif" }}>
            CASA <span className="italic text-[#C19A6B]">VERDE</span>
          </Link>
        </header>

        {/* Migas de pan (Breadcrumbs) */}
        <nav className="flex items-center justify-center lg:justify-start text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400 mb-12 gap-2 sm:gap-3">
          <Link href="/carrito" className="hover:text-[#C19A6B] transition-colors">Bolsa</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#154734] font-bold">Información</span>
          <ChevronRight className="w-3 h-3" />
          <span>Pago</span>
        </nav>

        <div className="max-w-2xl mx-auto lg:mx-0 w-full">
          {/* 1. SECCIÓN CONTACTO */}
          <section className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl sm:text-2xl text-[#154734] tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
                Contacto
              </h2>
              <Link href="/login" className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#C19A6B] hover:text-[#154734] transition-colors">
                Iniciar sesión
              </Link>
            </div>
            <div className="space-y-4">
              <input 
                type="email" 
                placeholder="Correo electrónico" 
                className="w-full px-5 py-4 bg-[#FAFAFA] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-300 placeholder:text-gray-400 text-sm shadow-inner hover:shadow-md"
              />
              <label className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 cursor-pointer group w-fit">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer appearance-none w-5 h-5 border border-gray-300 rounded focus:ring-2 focus:ring-[#154734]/20 checked:bg-[#154734] checked:border-[#154734] transition-colors cursor-pointer" />
                  <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 10 8 14 16 6"></polyline></svg>
                  </div>
                </div>
                <span className="group-hover:text-[#154734] transition-colors">Enviarme novedades y ofertas exclusivas</span>
              </label>
            </div>
          </section>

          {/* 2. SECCIÓN ENTREGA */}
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl text-[#154734] tracking-tight mb-6" style={{ fontFamily: "Georgia, serif" }}>
              Dirección de entrega
            </h2>
            <div className="space-y-4">
              <div className="relative group">
                <select className="w-full px-5 py-4 bg-[#FAFAFA] border border-gray-100 rounded-2xl appearance-none text-gray-700 outline-none focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 transition-all duration-300 text-sm shadow-inner group-hover:shadow-md cursor-pointer">
                  <option>Colombia</option>
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Nombre" className="w-full px-5 py-4 bg-[#FAFAFA] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-300 placeholder:text-gray-400 text-sm shadow-inner hover:shadow-md" />
                <input type="text" placeholder="Apellidos" className="w-full px-5 py-4 bg-[#FAFAFA] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-300 placeholder:text-gray-400 text-sm shadow-inner hover:shadow-md" />
              </div>

              <input type="text" placeholder="Cédula de ciudadanía" className="w-full px-5 py-4 bg-[#FAFAFA] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-300 placeholder:text-gray-400 text-sm shadow-inner hover:shadow-md" />
              <input type="text" placeholder="Dirección (Calle, Carrera, Avenida...)" className="w-full px-5 py-4 bg-[#FAFAFA] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-300 placeholder:text-gray-400 text-sm shadow-inner hover:shadow-md" />
              <input type="text" placeholder="Apartamento, local, etc. (Opcional)" className="w-full px-5 py-4 bg-[#FAFAFA] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-300 placeholder:text-gray-400 text-sm shadow-inner hover:shadow-md" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input type="text" placeholder="Ciudad" className="w-full px-5 py-4 bg-[#FAFAFA] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-300 placeholder:text-gray-400 text-sm shadow-inner hover:shadow-md" />
                <div className="relative group">
                  <select className="w-full px-5 py-4 bg-[#FAFAFA] border border-gray-100 rounded-2xl appearance-none text-gray-700 outline-none focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 transition-all duration-300 text-sm shadow-inner group-hover:shadow-md cursor-pointer">
                    <option value="" disabled selected>Departamento</option>
                    <option>Antioquia</option>
                    <option>Bogotá D.C.</option>
                    <option>Santander</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <input type="text" placeholder="Cód. Postal" className="w-full px-5 py-4 bg-[#FAFAFA] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-300 placeholder:text-gray-400 text-sm shadow-inner hover:shadow-md" />
              </div>

              <input type="tel" placeholder="Teléfono móvil" className="w-full px-5 py-4 bg-[#FAFAFA] border border-gray-100 rounded-2xl focus:bg-white focus:border-[#C19A6B] focus:ring-4 focus:ring-[#C19A6B]/15 outline-none transition-all duration-300 placeholder:text-gray-400 text-sm shadow-inner hover:shadow-md" />

              <label className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 cursor-pointer group w-fit pt-2">
                <div className="relative flex items-center justify-center">
                  <input type="checkbox" className="peer appearance-none w-5 h-5 border border-gray-300 rounded focus:ring-2 focus:ring-[#154734]/20 checked:bg-[#154734] checked:border-[#154734] transition-colors cursor-pointer" />
                  <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 10 8 14 16 6"></polyline></svg>
                  </div>
                </div>
                <span className="group-hover:text-[#154734] transition-colors">Guardar información para la próxima vez</span>
              </label>
            </div>
          </section>

          {/* 3. MÉTODOS DE ENVÍO */}
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl text-[#154734] tracking-tight mb-6" style={{ fontFamily: "Georgia, serif" }}>
              Método de envío
            </h2>
            <div className="border border-[#C19A6B]/40 bg-[#FAFAFA] rounded-2xl p-5 sm:p-6 flex justify-between items-center shadow-[0_5px_15px_rgba(193,154,107,0.08)] relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#C19A6B]" />
              <span className="text-sm font-bold text-[#154734] tracking-wide ml-2">Envío Nacional Premium</span>
              <span className="text-sm font-bold text-[#C19A6B]">${shippingCost.toLocaleString()}</span>
            </div>
          </section>

          {/* 4. PAGO */}
          <section className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl sm:text-2xl text-[#154734] tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
                Pago
              </h2>
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C19A6B]" /> Seguro
              </span>
            </div>
            
            <div className="border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-500 bg-white">
              {/* Mercado Pago Header */}
              <div className="bg-[#FAFAFA] border-b border-gray-100 p-5 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <input type="radio" checked readOnly className="appearance-none w-5 h-5 border-2 border-[#154734] rounded-full" />
                    <div className="absolute w-2.5 h-2.5 bg-[#154734] rounded-full" />
                  </div>
                  <span className="font-bold text-[#154734] tracking-wide">Mercado Pago</span>
                </div>
                <div className="flex gap-2">
                  {/* Logos estilizados */}
                  <div className="w-8 h-5 sm:w-10 sm:h-6 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm">
                    <span className="text-[7px] sm:text-[9px] font-black text-blue-600">PSE</span>
                  </div>
                  <div className="w-8 h-5 sm:w-10 sm:h-6 bg-white border border-gray-200 rounded flex items-center justify-center shadow-sm">
                    <span className="text-[7px] sm:text-[9px] font-black text-[#154734] italic">VISA</span>
                  </div>
                </div>
              </div>
              {/* Mercado Pago Body */}
              <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(193,154,107,0.03)_0,transparent_70%)]" />
                <CreditCard className="w-12 h-12 text-[#C19A6B]/50 mb-5" strokeWidth={1} />
                <p className="text-sm text-gray-500 font-light max-w-xs leading-relaxed relative z-10">
                  Serás redirigida a la plataforma segura de Mercado Pago para finalizar tu compra con tarjeta o PSE.
                </p>
              </div>
            </div>
          </section>

          {/* 5. DIRECCIÓN DE FACTURACIÓN */}
          <section className="mb-12">
            <h2 className="text-xl sm:text-2xl text-[#154734] tracking-tight mb-6" style={{ fontFamily: "Georgia, serif" }}>
              Facturación
            </h2>
            <div className="border border-gray-200 rounded-[2rem] overflow-hidden shadow-sm bg-white">
              <label className="flex items-center gap-4 p-5 sm:p-6 border-b border-gray-100 cursor-pointer hover:bg-[#FAFAFA] transition-colors">
                <div className="relative flex items-center justify-center shrink-0">
                  <input 
                    type="radio" 
                    name="billing" 
                    checked={billingSameAsShipping} 
                    onChange={() => setBillingSameAsShipping(true)}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 checked:border-[#154734] rounded-full transition-colors cursor-pointer" 
                  />
                  <div className="absolute w-2.5 h-2.5 bg-[#154734] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-sm font-medium text-gray-700">Misma dirección de envío</span>
              </label>
              <label className="flex items-center gap-4 p-5 sm:p-6 cursor-pointer hover:bg-[#FAFAFA] transition-colors">
                <div className="relative flex items-center justify-center shrink-0">
                  <input 
                    type="radio" 
                    name="billing" 
                    checked={!billingSameAsShipping} 
                    onChange={() => setBillingSameAsShipping(false)}
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 checked:border-[#154734] rounded-full transition-colors cursor-pointer" 
                  />
                  <div className="absolute w-2.5 h-2.5 bg-[#154734] rounded-full opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-sm font-medium text-gray-700">Usar una dirección distinta</span>
              </label>
            </div>
          </section>

          {/* BOTÓN PAGAR */}
          <button className="w-full bg-[#154734] text-white text-sm sm:text-base font-bold uppercase tracking-[0.2em] py-6 rounded-2xl hover:bg-[#C19A6B] shadow-[0_15px_30px_-10px_rgba(21,71,52,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(193,154,107,0.6)] transition-all duration-500 active:scale-[0.98] mb-10 relative overflow-hidden group">
            <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="relative z-10">Pagar Pedido</span>
          </button>

          {/* FOOTER SIMPLE */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[10px] sm:text-xs uppercase tracking-widest text-gray-400 font-bold border-t border-gray-100 pt-8">
            <Link href="#" className="hover:text-[#C19A6B] transition-colors">Reembolsos</Link>
            <Link href="#" className="hover:text-[#C19A6B] transition-colors">Envíos</Link>
            <Link href="#" className="hover:text-[#C19A6B] transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-[#C19A6B] transition-colors">Términos</Link>
          </div>
        </div>
      </div>

      {/* --- COLUMNA DERECHA (RESUMEN FIJO DESKTOP) --- */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#FAFAFA] px-8 xl:px-16 pt-16 pb-20 justify-center">
        
        {/* Tarjeta de Resumen Flotante Premium */}
        <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-gray-100 p-8 xl:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] h-fit sticky top-16 relative overflow-hidden group isolate">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#C19A6B]/10 to-transparent rounded-bl-full pointer-events-none -z-10" />

          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-[#154734] mb-8 border-b border-gray-100 pb-4">
            Tu Selección
          </h3>

          {/* Lista de productos */}
          <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent pr-2">
            {items.map((item) => (
              <div key={item.id} className="flex gap-5 items-center group/item">
                <div className="relative w-[72px] h-[84px] rounded-2xl bg-[#FAFAFA] border border-gray-100 overflow-hidden shrink-0 group-hover/item:border-[#C19A6B]/50 transition-colors duration-300">
                  <Image src={item.image} alt={item.name} fill className="object-cover group-hover/item:scale-110 transition-transform duration-700" />
                  <div className="absolute top-0 right-0 bg-[#154734] text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-bl-2xl z-10 shadow-sm">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#154734] uppercase tracking-wide truncate group-hover/item:text-[#C19A6B] transition-colors">{item.name}</p>
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-1">{item.color}</p>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  ${(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Código de descuento */}
          <div className="flex gap-3 mb-8 bg-[#FAFAFA] p-2 rounded-2xl border border-gray-100">
            <input 
              type="text" 
              placeholder="Código de regalo" 
              className="flex-1 px-4 py-3 bg-transparent outline-none text-sm placeholder:text-gray-400 uppercase tracking-wider font-medium text-[#154734]" 
            />
            <button className="bg-white border border-gray-200 text-gray-400 hover:text-[#154734] hover:border-[#154734] text-xs font-bold uppercase tracking-widest px-6 rounded-xl transition-all duration-300">
              Aplicar
            </button>
          </div>

          {/* Totales */}
          <div className="space-y-4 text-sm text-gray-500 font-medium mb-6 px-2">
            <div className="flex justify-between items-center">
              <span>Subtotal</span>
              <span className="text-gray-800">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Envío Nacional</span>
              <span className="text-gray-800">${shippingCost.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-between items-end px-2">
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400">Total a pagar</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[#C19A6B] font-bold">COP</span>
              <span className="text-3xl font-light text-[#154734] tracking-tighter" style={{ fontFamily: "Georgia, serif" }}>
                ${total.toLocaleString()}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}