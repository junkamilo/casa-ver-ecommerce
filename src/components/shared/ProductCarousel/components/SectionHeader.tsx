import Link from "next/link";
import { SectionConfig } from "../types";

const BRAND_GOLD = "#C19A6B";

interface SectionHeaderProps {
  config: Pick<SectionConfig, "titleStart" | "titleItalic" | "linkHref" | "linkText">;
}

const SectionHeader = ({ config }: SectionHeaderProps) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 w-full">
    <div>
      <h2
        className="text-3xl sm:text-4xl md:text-5xl font-light text-[#154734] leading-none"
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
      className="group flex items-center gap-2.5 text-[11px] font-black tracking-[0.32em] uppercase text-[#154734] hover:text-[#C19A6B] transition-colors duration-300 pb-2 p-2 touch-target active:scale-95"
    >
      {config.linkText}
      <span className="h-px w-5 bg-[#154734]/30 group-hover:w-9 group-hover:bg-[#C19A6B] transition-all duration-350 ease-out" />
    </Link>
  </div>
);

export default SectionHeader;
