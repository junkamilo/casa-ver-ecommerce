import Link from "next/link";
import { CheckCircle2, LogIn } from "lucide-react";

export default function SuccessStep() {
  return (
    <div className="w-full max-w-md mx-auto text-center">
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>

      <h2
        className="text-2xl sm:text-3xl font-bold text-[#154734] mb-3"
        style={{ fontFamily: "Georgia, serif" }}
      >
        ¡Contraseña actualizada!
      </h2>

      <p className="text-sm text-gray-500 leading-relaxed mb-8">
        Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
      </p>

      <Link
        href="/login"
        className="inline-flex items-center justify-center gap-2 w-full bg-[#154734] hover:bg-[#0f3829] text-white font-semibold py-3.5 text-sm rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        <LogIn className="w-4 h-4" />
        Iniciar sesión
      </Link>
    </div>
  );
}
