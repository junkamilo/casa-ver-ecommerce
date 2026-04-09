export const BANK_INFO: Record<string, { name: string; detail: string; color: string }> = {
  NEQUI:       { name: "Nequi",       detail: "Número: 300 123 4567",               color: "text-[#6C1D8E]" },
  BANCOLOMBIA: { name: "Bancolombia", detail: "Cuenta Ahorros: 123-456789-00",      color: "text-[#8B6914]" },
  DAVIPLATA:   { name: "Daviplata",   detail: "Número: 300 987 6543",               color: "text-red-600" },
  ADDI:        { name: "Addi",        detail: "Pronto recibirás un enlace de Addi", color: "text-[#00C2A8]" },
};

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "573001234567";
