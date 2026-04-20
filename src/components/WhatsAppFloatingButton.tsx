"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send } from "lucide-react";

const WA_NUMBER = "573022457432";
const AGENT_NAME = "Casa Verde";
const AGENT_AVATAR = "/assets/logo.png";
const DEFAULT_MESSAGE = "¡Hola! Estoy interesado/a en sus productos y me gustaría recibir más información. 😊";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function WhatsAppFloatingButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(message.length, message.length);
    }
  }, [open]);

  const handleSend = () => {
    const encoded = encodeURIComponent(message.trim() || DEFAULT_MESSAGE);
    window.open(`https://wa.me/${WA_NUMBER}?text=${encoded}`, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      {/* Mini chat */}
      <div
        className={`transition-all duration-300 origin-bottom-right ${
          open
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 translate-y-2 pointer-events-none"
        }`}
      >
        <div className="w-[300px] sm:w-[320px] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          {/* Header */}
          <div className="bg-[#075E54] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <WhatsAppIcon />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">{AGENT_NAME}</p>
              <p className="text-green-300 text-xs">En línea</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              aria-label="Cerrar chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat body */}
          <div className="bg-[#ECE5DD] px-4 py-4">
            {/* Bubble from agent */}
            <div className="flex items-end gap-2 mb-4">
              <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-sm px-3 py-2 shadow-sm">
                <p className="text-gray-800 text-sm leading-relaxed">
                  ¡Hola! 👋 Bienvenido/a a <span className="font-semibold text-[#154734]">Casa Verde</span>. ¿En qué podemos ayudarte hoy?
                </p>
                <span className="text-[10px] text-gray-400 block text-right mt-1">Ahora</span>
              </div>
            </div>

            {/* Input area */}
            <div className="flex items-end gap-2 bg-white rounded-2xl px-3 py-2 shadow-sm">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                className="flex-1 resize-none text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent leading-relaxed max-h-24"
                placeholder="Escribe un mensaje..."
              />
              <button
                onClick={handleSend}
                className="flex-shrink-0 w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#1ebe5c] text-white flex items-center justify-center transition-colors active:scale-90"
                aria-label="Enviar por WhatsApp"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAB button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5c] text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center active:scale-90 relative"
        aria-label="Abrir chat de WhatsApp"
      >
        <span
          className={`transition-all duration-200 ${open ? "opacity-0 scale-75 absolute" : "opacity-100 scale-100"}`}
        >
          <WhatsAppIcon />
        </span>
        <span
          className={`transition-all duration-200 ${open ? "opacity-100 scale-100" : "opacity-0 scale-75 absolute"}`}
        >
          <X className="w-6 h-6" />
        </span>

        {/* Ping animado cuando está cerrado */}
        {!open && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>
    </div>
  );
}
