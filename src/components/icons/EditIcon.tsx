import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "className"> {
  size?: number | string;
  className?: string;
}

export function EditIcon({ size = 24, className = "", ...props }: IconProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-lg p-1.5",
        "text-gray-400 transition-colors",
        "hover:bg-[#C19A6B]/10 hover:text-[#C19A6B]",
        "group-hover:bg-[#C19A6B]/10 group-hover:text-[#C19A6B]",
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
        <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
        <path d="m15 5 4 4" />
      </svg>
    </span>
  );
}
