import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "className"> {
  size?: number | string;
  className?: string;
}

export function CircleXIcon({ size = 24, className = "", ...props }: IconProps) {
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
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    </span>
  );
}
