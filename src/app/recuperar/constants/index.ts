import { KeyRound, ShieldCheck, Lock } from "lucide-react";

export const STEPS = [
  { icon: KeyRound,    text: "Ingresa tu correo de recuperación" },
  { icon: ShieldCheck, text: "Verifica el código que recibirás" },
  { icon: Lock,        text: "Crea tu nueva contraseña segura" },
] as const;
