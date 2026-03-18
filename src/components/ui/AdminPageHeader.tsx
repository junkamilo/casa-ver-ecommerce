import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface ActionButton {
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}

interface AdminPageHeaderProps {
  title: string;
  action?: ActionButton;
}

export default function AdminPageHeader({ title, action }: AdminPageHeaderProps) {
  const btnClass =
    "inline-flex items-center justify-center gap-2 bg-[#154734] hover:bg-[#0f3626] text-white px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg active:scale-95 font-medium text-sm";

  return (
    <div className="flex flex-col items-center gap-4 pt-2 pb-1">
      <div className="text-center">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C19A6B] mb-1">
          Casa Verde
        </p>
        <h1
          className="text-3xl sm:text-4xl font-bold text-[#154734] leading-tight"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {title}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="h-px w-10 bg-[#C19A6B]/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#C19A6B]" />
          <div className="h-px w-10 bg-[#C19A6B]/40" />
        </div>
      </div>

      {action && (
        action.onClick ? (
          <button onClick={action.onClick} className={btnClass}>
            <action.icon className="w-4 h-4 shrink-0" />
            {action.label}
          </button>
        ) : (
          <Link href={action.href!} className={btnClass}>
            <action.icon className="w-4 h-4 shrink-0" />
            {action.label}
          </Link>
        )
      )}
    </div>
  );
}
