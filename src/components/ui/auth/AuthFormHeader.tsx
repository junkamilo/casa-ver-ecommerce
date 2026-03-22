import type { LucideIcon } from "lucide-react";

interface AuthFormHeaderProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  /** "left" alinea al centro en móvil y a la izquierda en desktop (default).
   *  "center" fuerza centrado en todos los tamaños. */
  align?: "left" | "center";
}

const AuthFormHeader = ({
  title,
  subtitle,
  icon: Icon,
  align = "left",
}: AuthFormHeaderProps) => (
  <div className={`mb-7 ${align === "center" ? "text-center" : "text-center lg:text-left"}`}>
    {Icon && (
      <div
        className={`w-14 h-14 rounded-full bg-[#154734]/10 flex items-center justify-center mb-4 ${
          align === "center" ? "mx-auto" : "mx-auto lg:mx-0"
        }`}
      >
        <Icon className="w-7 h-7 text-[#154734]" />
      </div>
    )}
    <h2
      className="text-2xl sm:text-3xl font-bold text-[#154734] mb-1.5"
      style={{ fontFamily: "Georgia, serif" }}
    >
      {title}
    </h2>
    <p className="text-sm text-gray-500 leading-relaxed">{subtitle}</p>
  </div>
);

export default AuthFormHeader;
