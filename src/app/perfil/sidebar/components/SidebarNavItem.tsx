import { NavItem } from "../types";

interface Props {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  mobile?: boolean;
}

export function SidebarNavItem({ item, isActive, onClick, mobile = false }: Props) {
  const Icon = item.icon;

  if (mobile) {
    return (
      <button
        onClick={onClick}
        className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 text-xs font-medium transition-colors border-b-2 ${
          isActive
            ? "border-[#154734] text-[#154734]"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        <Icon className="w-4 h-4" />
        {item.label}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
        isActive
          ? "bg-[#154734] text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <div
        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
          isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-gray-200"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-left">
        <p>{item.label}</p>
        <p className={`text-[11px] mt-0.5 ${isActive ? "text-white/70" : "text-gray-400"}`}>
          {item.description}
        </p>
      </div>
    </button>
  );
}
