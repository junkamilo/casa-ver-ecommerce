import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "className"> {
  size?: number | string;
  className?: string;
}

export function ShirtIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <span className="inline-flex items-center justify-center shrink-0">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("pointer-events-none shrink-0", className)}
        aria-hidden
        {...props}
      >
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </svg>
    </span>
  );
}

export function StackedShirtIcon({ className = "" }: IconProps) {
  return (
    <span className={cn("relative inline-block shrink-0", className)}>
      <span className="absolute left-0 top-0 opacity-45">
        <ShirtIcon size={14} />
      </span>
      <span className="absolute left-1.5 top-1.5">
        <ShirtIcon size={14} />
      </span>
    </span>
  );
}
