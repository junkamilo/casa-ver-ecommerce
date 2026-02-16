"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

// Logos de tarjetas (Puedes usar imágenes reales o estos placeholders de texto)
const PaymentIcons = () => (
  <div className="flex gap-2">
    {["Visa", "Master", "Amex"].map((card) => (
      <div key={card} className="h-6 w-9 bg-white border rounded flex items-center justify-center text-[8px] font-bold text-gray-600">
        {card}
      </div>
    ))}
  </div>
);

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const shippingCost = 18000; // Costo fijo según tu imagen
  const total = subtotal + shippingCost;

  // Estado simple para controlar los radio buttons
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans text-[#333]">
      
      {/* --- COLUMNA IZQUIERDA (FORMULARIO) --- */}
      <div className="flex-1 lg:w-[58%] flex flex-col px-4 sm:px-8 lg:px-14 pt-8 pb-12 order-2 lg:order-1">
        
        {/* Header Simple (Solo Logo) */}
        <header className="mb-8 flex items-center justify-between lg:block">
          <Link href="/" className="text-3xl font-serif text-[#c19a6b] tracking-wide">
            amatto
          </Link>
          {/* En móvil mostramos el carrito resumido aquí si quisieras, por ahora solo el logo */}
        </header>

        {/* Migas de pan (Breadcrumbs) */}
        <nav className="flex items-center text-xs text-muted-foreground mb-8 gap-2">
           <span className="text-brand">Carrito</span> <ChevronDown className="-rotate-90 w-3 h-3" />
           <span className="text-foreground font-medium">Información</span> <ChevronDown className="-rotate-90 w-3 h-3" />
           <span>Envíos</span> <ChevronDown className="-rotate-90 w-3 h-3" />
           <span>Pago</span>
        </nav>

        {/* 1. SECCIÓN CONTACTO */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Contacto</h2>
            <Link href="/login" className="text-sm text-[#c19a6b] underline hover:no-underline">
              Iniciar sesión
            </Link>
          </div>
          <input 
            type="email" 
            placeholder="Correo electrónico" 
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#c19a6b] focus:border-transparent outline-none mb-3"
          />
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-[#c19a6b] focus:ring-[#c19a6b]" />
            Enviarme novedades y ofertas por correo electrónico
          </label>
        </section>

        {/* 2. SECCIÓN ENTREGA */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Entrega</h2>
          <div className="space-y-3">
            <div className="relative">
              <select className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white text-gray-700 outline-none focus:ring-1 focus:ring-[#c19a6b]">
                <option>Colombia</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Nombre" className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#c19a6b]" />
              <input type="text" placeholder="Apellidos" className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#c19a6b]" />
            </div>

            <input type="text" placeholder="Cédula" className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#c19a6b]" />
            
            <input type="text" placeholder="Dirección" className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#c19a6b]" />
            
            <input type="text" placeholder="Casa, apartamento, etc. (opcional)" className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#c19a6b]" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="text" placeholder="Ciudad" className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#c19a6b]" />
              <div className="relative">
                <select className="w-full p-3 border border-gray-300 rounded-md appearance-none bg-white text-gray-700 outline-none focus:ring-1 focus:ring-[#c19a6b]">
                   <option>Santander</option>
                   <option>Bogotá D.C.</option>
                   <option>Antioquia</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              <input type="text" placeholder="Código postal (opcional)" className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#c19a6b]" />
            </div>

            <div className="relative">
               <input type="tel" placeholder="Teléfono" className="w-full p-3 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-[#c19a6b]" />
               <div className="absolute right-3 top-1/2 -translate-y-1/2 group cursor-help">
                 <span className="w-4 h-4 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">?</span>
               </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer pt-2">
              <input type="checkbox" className="rounded border-gray-300 text-[#c19a6b] focus:ring-[#c19a6b]" />
              Guardar mi información y consultar más rápidamente la próxima vez
            </label>
          </div>
        </section>

        {/* 3. MÉTODOS DE ENVÍO */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Métodos de envío</h2>
          <div className="border border-[#c19a6b] bg-[#fdf8f4] rounded-md p-4 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-800">Envío nacional</span>
            <span className="text-sm font-bold text-gray-900">${shippingCost.toLocaleString()}</span>
          </div>
        </section>

        {/* 4. PAGO */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-2">Pago</h2>
          <p className="text-sm text-gray-500 mb-4">Todas las transacciones son seguras y están encriptadas.</p>
          
          <div className="border border-gray-300 rounded-md overflow-hidden">
            {/* Mercado Pago Header */}
            <div className="bg-[#f0f5ff] border-b border-gray-300 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full border-[5px] border-[#3483fa] bg-white"></div>
                <span className="font-semibold text-gray-800">Mercado Pago</span>
              </div>
              <div className="flex gap-1">
                 {/* Iconos simulados de MP */}
                 <span className="text-[10px] bg-white border px-1 rounded text-blue-500 font-bold">PSE</span>
                 <span className="text-[10px] bg-white border px-1 rounded text-blue-800 font-bold">VISA</span>
                 <span className="text-[10px] bg-white border px-1 rounded text-red-500 font-bold">MC</span>
              </div>
            </div>
            {/* Mercado Pago Body */}
            <div className="bg-gray-50 p-8 text-center border-t border-gray-200">
              <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-sm text-gray-600 px-4">
                Se te redirigirá a Mercado Pago para que completes la compra de forma segura.
              </p>
            </div>
          </div>
        </section>

        {/* 5. DIRECCIÓN DE FACTURACIÓN */}
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Dirección de facturación</h2>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <label className="flex items-center gap-3 p-4 border-b border-gray-300 cursor-pointer bg-white">
              <input 
                type="radio" 
                name="billing" 
                checked={billingSameAsShipping} 
                onChange={() => setBillingSameAsShipping(true)}
                className="w-4 h-4 text-[#c19a6b] focus:ring-[#c19a6b]" 
              />
              <span className="text-sm font-medium text-gray-700">La misma dirección de envío</span>
            </label>
            <label className="flex items-center gap-3 p-4 cursor-pointer bg-white">
              <input 
                type="radio" 
                name="billing" 
                checked={!billingSameAsShipping} 
                onChange={() => setBillingSameAsShipping(false)}
                className="w-4 h-4 text-[#c19a6b] focus:ring-[#c19a6b]" 
              />
              <span className="text-sm font-medium text-gray-700">Usar una dirección de facturación distinta</span>
            </label>
          </div>
        </section>

        {/* BOTÓN PAGAR */}
        <button className="w-full py-5 bg-[#197bbd] hover:bg-[#15669e] text-white font-bold rounded-md text-lg transition-colors shadow-sm mb-6">
          Pagar ahora
        </button>

        <hr className="border-gray-200 mb-4" />

        {/* FOOTER SIMPLE */}
        <div className="flex flex-wrap gap-4 text-xs text-[#c19a6b] underline">
           <Link href="#">Política de reembolso</Link>
           <Link href="#">Envío</Link>
           <Link href="#">Política de privacidad</Link>
           <Link href="#">Términos del servicio</Link>
        </div>
      </div>

      {/* --- COLUMNA DERECHA (RESUMEN DE ORDEN) --- */}
      {/* Mobile/Tablet: resumen colapsable arriba del formulario */}
      <div className="lg:hidden bg-[#fafafa] border-b border-gray-200 px-4 sm:px-8 py-6 order-1">
         <details className="group">
           <summary className="flex items-center justify-between cursor-pointer list-none">
             <span className="text-sm font-medium text-[#c19a6b] flex items-center gap-2">
               <ShoppingBag className="w-4 h-4" />
               Mostrar resumen del pedido
             </span>
             <span className="text-lg font-bold text-gray-900">${total.toLocaleString()} COP</span>
           </summary>
           <div className="mt-4 space-y-4">
             {items.map((item) => (
               <div key={item.id} className="flex gap-4 items-center">
                 <div className="relative w-14 h-14 border border-gray-200 rounded-md bg-white p-1">
                   <div className="relative w-full h-full overflow-hidden rounded-sm">
                     <Image src={item.image} alt={item.name} fill className="object-cover" />
                   </div>
                   <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full z-10">
                     {item.quantity}
                   </span>
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                   <p className="text-xs text-gray-500">{item.color}</p>
                 </div>
                 <span className="text-sm font-medium text-gray-800 shrink-0">
                   ${(item.price * item.quantity).toLocaleString()}
                 </span>
               </div>
             ))}
             <hr className="border-gray-300" />
             <div className="space-y-2 text-sm text-gray-600">
               <div className="flex justify-between">
                 <span>Subtotal</span>
                 <span className="font-medium text-gray-900">${subtotal.toLocaleString()}</span>
               </div>
               <div className="flex justify-between">
                 <span>Envío</span>
                 <span className="font-medium text-gray-900">${shippingCost.toLocaleString()}</span>
               </div>
             </div>
           </div>
         </details>
      </div>

      {/* Desktop: columna lateral fija */}
      <div className="hidden lg:block lg:w-[42%] bg-[#fafafa] border-l border-gray-200 pt-12 px-8 order-2">
         {/* Lista de productos */}
         <div className="space-y-4 mb-8">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="relative w-16 h-16 border border-gray-200 rounded-md bg-white p-1">
                   <div className="relative w-full h-full overflow-hidden rounded-sm">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                   </div>
                   {/* Badge de cantidad */}
                   <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full z-10">
                     {item.quantity}
                   </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.color}</p>
                </div>
                <span className="text-sm font-medium text-gray-800">
                  ${(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
         </div>

         <hr className="border-gray-300 mb-6" />

         {/* Código de descuento (Extra, como en Shopify) */}
         <div className="flex gap-3 mb-8">
            <input type="text" placeholder="Código de descuento" className="flex-1 p-3 border border-gray-300 rounded-md outline-none focus:ring-1 focus:ring-gray-400" />
            <button className="bg-[#c8c8c8] text-white font-semibold px-6 rounded-md cursor-not-allowed">Usar</button>
         </div>

         <hr className="border-gray-300 mb-6" />

         {/* Totales */}
         <div className="space-y-2 text-sm text-gray-600 mb-6">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-gray-900">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1">
                Envío <span className="w-3 h-3 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[8px] font-bold">?</span>
              </span>
              <span className="font-medium text-gray-900">${shippingCost.toLocaleString()}</span>
            </div>
         </div>

         <hr className="border-gray-300 mb-6" />

         <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-800">Total</span>
            <div className="flex items-baseline gap-2">
               <span className="text-xs text-gray-500">COP</span>
               <span className="text-2xl font-bold text-gray-900">${total.toLocaleString()}</span>
            </div>
         </div>
      </div>
    </div>
  );
}