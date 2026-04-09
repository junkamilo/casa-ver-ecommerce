import { Package, Star, ShieldCheck } from "lucide-react";

export const LOGIN_EYEBROW = "Tu cuenta en";

export const LOGIN_BENEFITS = [
  { icon: Package,     text: "Seguimiento en tiempo real de tus pedidos" },
  { icon: Star,        text: "Acceso a ofertas y descuentos exclusivos" },
  { icon: ShieldCheck, text: "Compra segura con tus datos protegidos" },
] as const;
