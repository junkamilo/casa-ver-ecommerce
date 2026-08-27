import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "className"> {
  size?: number | string;
  className?: string;
}

export function SearchIcon({ size = 24, className = "", ...props }: IconProps) {
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
        <path d="m21 21-4.34-4.34" />
        <circle cx="11" cy="11" r="8" />
      </svg>
    </span>
  );
}
