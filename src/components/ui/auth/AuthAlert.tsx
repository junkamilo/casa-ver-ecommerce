import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

type AlertVariant = "error" | "success" | "info";

interface AuthAlertProps {
  message: string | null;
  variant?: AlertVariant;
}

const VARIANTS = {
  error:   { cls: "bg-red-50 border-red-500 text-red-700",   Icon: AlertTriangle },
  success: { cls: "bg-green-50 border-green-500 text-green-700", Icon: CheckCircle2 },
  info:    { cls: "bg-blue-50 border-blue-500 text-blue-700",  Icon: Info },
} as const;

const AuthAlert = ({ message, variant = "error" }: AuthAlertProps) => {
  if (!message) return null;
  const { cls, Icon } = VARIANTS[variant];

  return (
    <div
      className={`mb-5 p-3 ${cls} border-l-4 flex items-start gap-2 rounded text-xs sm:text-sm animate-in fade-in`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <p>{message}</p>
    </div>
  );
};

export default AuthAlert;
