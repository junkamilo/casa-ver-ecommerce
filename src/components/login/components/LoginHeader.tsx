import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const LoginHeader = () => (
  <div>
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#154734] transition-colors mb-4"
    >
      <ArrowLeft className="w-4 h-4" />
      Volver al inicio
    </Link>

    <div className="text-center mb-6 sm:mb-8">
      <h2
        className="text-xl sm:text-2xl font-bold text-[#154734] mb-2"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Bienvenido de nuevo
      </h2>
      <p className="text-xs sm:text-sm text-muted-foreground">
        Ingresa a tu cuenta para gestionar tus pedidos
      </p>
    </div>
  </div>
);

export default LoginHeader;
