"use client";

import { SidebarNavItemProps } from "../types";

export function SidebarNavItem({ item, isActive, onClick, mobile = false }: SidebarNavItemProps) {
  const Icon = item.icon;

  if (mobile) {
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
          isActive
            ? "border-[#154734] text-[#154734]"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span>{item.label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
        isActive
          ? "bg-[#154734] text-white shadow-md"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight">{item.label}</p>
        <p className={`text-xs leading-tight mt-0.5 ${isActive ? "text-white/70" : "text-gray-400"}`}>
          {item.description}
        </p>
      </div>
    </button>
  );
}
