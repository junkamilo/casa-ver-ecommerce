"use client"; // <--- Importante: Esto habilita el uso de hooks como usePathname

import Link from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

// Definimos la interfaz para que acepte las mismas propiedades que tenías antes
interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string; // Mantenemos 'to' para compatibilidad
  activeClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ className, activeClassName, to, ...props }, ref) => {
    const pathname = usePathname();
    
    // Lógica para detectar si el link está activo:
    // 1. Si el link es "/", solo se activa si estamos exactamente en el home.
    // 2. Si es otra ruta (ej: /hombre), se activa si la URL actual empieza por ahí.
    const isActive = 
      to === "/" 
        ? pathname === "/" 
        : pathname?.startsWith(to);

    return (
      <Link
        href={to} // Next.js usa 'href', así que le pasamos tu 'to' aquí
        ref={ref}
        className={cn(className, isActive && activeClassName)}
        {...props}
      >
        {props.children}
      </Link>
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };
