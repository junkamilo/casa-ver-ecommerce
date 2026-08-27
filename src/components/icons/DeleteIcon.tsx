import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "className"> {
  size?: number | string;
  className?: string;
}

export function DeleteIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-1.5",
        "text-gray-400 transition-colors",
        "hover:bg-red-50 hover:text-red-600",
        "group-hover:bg-red-50 group-hover:text-red-600",
        className,
      )}
    >
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
        className="pointer-events-none shrink-0"
        aria-hidden
        {...props}
      >
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    </span>
  );
}
