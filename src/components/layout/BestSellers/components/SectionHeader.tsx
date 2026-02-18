import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SectionHeader = () => (
  <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
    <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-foreground uppercase title-accent">
      MÁS VENDIDOS
    </h2>
    <Link
      href="/collections/mas-vendidos"
      className="group flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-brand transition-colors"
    >
      Ver todo
      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </Link>
  </div>
);

export default SectionHeader;
