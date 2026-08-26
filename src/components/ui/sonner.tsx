"use client";

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toaster global (Sonner). Estilo admin: cards claras y legibles,
 * sin fondos verde oscuro sólidos.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      visibleToasts={4}
      duration={4200}
      gap={12}
      icons={{
        success: <CircleCheck className="h-5 w-5 text-emerald-600" />,
        info: <Info className="h-5 w-5 text-sky-600" />,
        warning: <TriangleAlert className="h-5 w-5 text-amber-600" />,
        error: <OctagonX className="h-5 w-5 text-red-600" />,
        loading: <LoaderCircle className="h-5 w-5 animate-spin text-gray-500" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast !flex !items-start !gap-3 !min-w-[min(100vw-2rem,22rem)] !max-w-[26rem] !rounded-2xl !border !px-4 !py-3.5 !shadow-lg !shadow-black/5 group-[.toaster]:z-[9999]",
          title: "!text-sm !font-semibold !leading-snug",
          description: "!text-xs !leading-relaxed !opacity-90",
          success:
            "!bg-emerald-50 !border-emerald-200/80 !text-emerald-950",
          error: "!bg-red-50 !border-red-200/80 !text-red-950",
          warning: "!bg-amber-50 !border-amber-200/80 !text-amber-950",
          info: "!bg-sky-50 !border-sky-200/80 !text-sky-950",
          loading: "!bg-white !border-gray-200 !text-gray-900",
          closeButton:
            "!bg-white/80 !border-black/5 !text-gray-500 hover:!bg-white",
          actionButton:
            "!bg-[#154734] !text-white !rounded-lg !text-xs !font-semibold",
          cancelButton:
            "!bg-white !text-gray-700 !border !border-gray-200 !rounded-lg !text-xs !font-semibold",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
