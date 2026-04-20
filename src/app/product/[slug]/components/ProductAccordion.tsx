"use client";

import { ChevronDown, Truck, CreditCard, Shirt, FileText, Clock } from "lucide-react";
import { CARE_INSTRUCTIONS, PRODUCTION_TIME_CONTENT } from "../constants";

interface Props {
  openKey: string | null;
  onToggle: (key: string) => void;
  description?: string;
}

export default function ProductAccordion({ openKey, onToggle, description }: Props) {
  const items = [
    {
      key: "descripcion",
      icon: <FileText className="w-4.5 h-4.5" strokeWidth={1.5} />,
      title: "Descripción",
      content: description ? (
        <p className="leading-relaxed">{description}</p>
      ) : (
        <p className="leading-relaxed text-gray-400 italic">Sin descripción disponible.</p>
      ),
    },
    {
      key: "confeccion",
      icon: <Clock className="w-4.5 h-4.5" strokeWidth={1.5} />,
      title: "Tiempo de Confección",
      content: (
        <ul className="space-y-2 text-sm">
          {PRODUCTION_TIME_CONTENT.map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C19A6B] shrink-0" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      key: "envio",
      icon: <Truck className="w-4.5 h-4.5" strokeWidth={1.5} />,
      title: "Envíos y Entregas",
      content: (
        <p className="leading-relaxed">
          El envío nacional se realiza con altos estándares de seguridad y llega a tu puerta
          de <strong>2 a 4 días hábiles</strong>.
          <span className="block mt-2 font-medium text-[#154734]">
            Costo de envío: $18,000 COP.
          </span>
        </p>
      ),
    },
    {
      key: "pago",
      icon: <CreditCard className="w-4.5 h-4.5" strokeWidth={1.5} />,
      title: "Métodos de Pago",
      content: (
        <p className="leading-relaxed">
          Garantizamos transacciones 100% seguras.{" "}
          <strong className="text-[#154734]">Recibimos todas las tarjetas</strong> de
          Crédito y Débito, PSE, Nequi, Davivienda y Bancolombia.
        </p>
      ),
    },
    {
      key: "cuidados",
      icon: <Shirt className="w-4.5 h-4.5" strokeWidth={1.5} />,
      title: "Cuidados de la Prenda",
      content: (
        <ul className="list-disc list-inside text-gray-600 space-y-2 text-sm">
          {CARE_INSTRUCTIONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <div className="border-t border-gray-100 mt-8">
      {items.map(({ key, icon, title, content }) => {
        const isOpen = openKey === key;

        return (
          <div key={key} className="border-b border-gray-100">
            <button
              onClick={() => onToggle(key)}
              className="w-full py-5 flex items-center justify-between text-left group transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C19A6B]/50"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-500 ${
                    isOpen
                      ? "bg-[#154734] text-white shadow-md"
                      : "bg-[#FAFAFA] text-[#154734] group-hover:bg-[#C19A6B]/10 group-hover:text-[#C19A6B]"
                  }`}
                >
                  {icon}
                </div>
                <span
                  className={`text-[11px] sm:text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${
                    isOpen ? "text-[#154734]" : "text-gray-500 group-hover:text-[#C19A6B]"
                  }`}
                >
                  {title}
                </span>
              </div>

              <ChevronDown
                className={`w-4 h-4 transition-transform duration-500 shrink-0 ${
                  isOpen ? "rotate-180 text-[#154734]" : "text-gray-300 group-hover:text-[#C19A6B]"
                }`}
                strokeWidth={1.5}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isOpen ? "max-h-96 opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"
              }`}
            >
              <div className="pl-13 pr-4 text-sm font-light text-gray-500">
                {content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
