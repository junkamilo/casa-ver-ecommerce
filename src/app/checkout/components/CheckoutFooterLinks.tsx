import Link from "next/link";

const LINKS = [
  { label: "Reembolsos", href: "#" },
  { label: "Envíos", href: "#" },
  { label: "Privacidad", href: "#" },
  { label: "Términos", href: "#" },
] as const;

const CheckoutFooterLinks = () => (
  <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[10px] sm:text-xs uppercase tracking-widest text-gray-400 font-bold border-t border-gray-200 pt-8 pb-4">
    {LINKS.map(({ label, href }) => (
      <Link key={label} href={href} className="hover:text-[#C19A6B] transition-colors">
        {label}
      </Link>
    ))}
  </div>
);

export default CheckoutFooterLinks;
