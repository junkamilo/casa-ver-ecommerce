import { AlertCircle } from "lucide-react";
import { FieldErrorProps } from "../../types";

export default function FieldError({ msg, withIcon = false }: FieldErrorProps) {
  if (!msg) return null;

  if (withIcon) {
    return (
      <div className="flex items-center gap-1.5 mt-1.5">
        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
        <p className="text-red-500 text-xs font-medium">{msg}</p>
      </div>
    );
  }

  return <p className="text-red-500 text-sm mt-1">{msg}</p>;
}
