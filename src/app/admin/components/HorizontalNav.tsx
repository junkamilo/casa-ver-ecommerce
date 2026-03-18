import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NAV_ITEMS } from "../constants";

export default function HorizontalNav() {
  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-3 pb-1 sm:grid sm:grid-cols-3 sm:overflow-x-visible sm:snap-none sm:pb-0 sm:gap-4 md:gap-5">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`group shrink-0 w-[72vw] snap-start sm:w-auto sm:shrink bg-white rounded-2xl border-2 ${item.borderColor} sm:border sm:border-gray-200 p-4 sm:p-5 md:p-6 ${item.hoverBorderColor} sm:hover:shadow-md active:scale-95 sm:active:scale-100 transition-all duration-200 relative overflow-hidden flex items-center gap-4 sm:flex-col sm:items-start`}
        >
          <div
            className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center shrink-0 sm:mb-3 sm:group-hover:scale-110 transition-transform duration-300`}
          >
            <item.icon className={`w-6 h-6 ${item.iconColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            <h3
              className={`font-bold text-gray-900 text-base sm:text-lg mb-0.5 ${item.hoverTextColor} transition-colors truncate`}
            >
              {item.label}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 sm:line-clamp-none">
              {item.description}
            </p>
          </div>

          <ArrowUpRight
            className={`w-5 h-5 ${item.arrowColor} shrink-0 transition-transform group-active:translate-x-0.5 group-active:-translate-y-0.5 sm:absolute sm:right-3 sm:top-3 sm:opacity-0 sm:group-hover:opacity-100`}
          />
        </Link>
      ))}
    </div>
  );
}
