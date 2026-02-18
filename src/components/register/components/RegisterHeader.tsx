import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const RegisterHeader = () => (
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
        Únete a Casa Verde
      </h2>
      <p className="text-xs sm:text-sm text-muted-foreground">
        Crea una cuenta para seguir tus pedidos y obtener beneficios.
      </p>
    </div>
  </div>
);

export default RegisterHeader;
