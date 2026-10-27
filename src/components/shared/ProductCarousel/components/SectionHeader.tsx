import Link from "next/link";
import { SectionConfig } from "../types";

const BRAND_GOLD = "var(--theme-accent)";

interface SectionHeaderProps {
  config: Pick<SectionConfig, "titleStart" | "titleItalic" | "linkHref" | "linkText">;
}

const SectionHeader = ({ config }: SectionHeaderProps) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 w-full">
    <div>
      <h2
        className="text-3xl sm:text-4xl md:text-5xl font-light text-[color:var(--theme-primary)] leading-none"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {config.titleStart}{" "}
        <span className="italic" style={{ color: BRAND_GOLD }}>
          {config.titleItalic}
        </span>
      </h2>
    </div>

    <Link
      href={config.linkHref}
      className="group flex items-center gap-2.5 text-[11px] font-black tracking-[0.32em] uppercase text-[color:var(--theme-primary)] hover:text-[color:var(--theme-accent)] transition-colors duration-300 pb-2 p-2 touch-target active:scale-95"
    >
      {config.linkText}
      <span className="h-px w-5 bg-[color:var(--theme-primary)]/30 group-hover:w-9 group-hover:bg-[color:var(--theme-accent)] transition-all duration-350 ease-out" />
    </Link>
  </div>
);

export default SectionHeader;
