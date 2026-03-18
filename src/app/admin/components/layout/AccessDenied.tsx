import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md border border-red-100">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h1>
        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
          Esta área es exclusiva para administradores de <strong>Casa Verde</strong>.
          Si crees que esto es un error, contacta a soporte.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-[#154734] text-white px-6 py-3 rounded-xl hover:bg-[#103a2a] transition-all w-full font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a la Tienda
        </Link>
      </div>
    </div>
  );
}
