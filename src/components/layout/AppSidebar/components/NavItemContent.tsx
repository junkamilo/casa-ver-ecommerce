import type { NavItemContentProps } from "../types";

export function NavItemContent({ item, collapsed }: NavItemContentProps) {
  const Icon = item.icon;
  return (
    <>
      {item.isActive && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#C19A6B] rounded-r-full" />
      )}
      <Icon
        className={`w-5 h-5 shrink-0 ${
          item.isActive ? "text-[#154734]" : "text-white/60 group-hover:text-white"
        }`}
      />
      {!collapsed && (
        <div className="text-left truncate">
          <p className="truncate">{item.label}</p>
          {item.description && (
            <p className={`text-[11px] mt-0.5 truncate ${item.isActive ? "text-[#154734]/60" : "text-white/40"}`}>
              {item.description}
            </p>
          )}
        </div>
      )}
    </>
  );
}
