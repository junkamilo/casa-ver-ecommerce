import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthTopBarProps {
  backHref?: string;
  backLabel?: string;
}

const AuthTopBar = ({
  backHref = "/",
  backLabel = "Volver al inicio",
}: AuthTopBarProps) => (
  <div className="shrink-0 flex items-center justify-between px-6 sm:px-10 pt-6 pb-4 border-b border-gray-100">
    <div className="flex items-center gap-2">
      <Image
        src="/icon.png"
        alt="Casa Verde"
        width={28}
        height={28}
        className="rounded-full"
      />
      <span
        className="text-xl font-bold text-[#154734]"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Casa Verde
      </span>
    </div>
    <Link
      href={backHref}
      className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#154734] transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      {backLabel}
    </Link>
  </div>
);

export default AuthTopBar;
