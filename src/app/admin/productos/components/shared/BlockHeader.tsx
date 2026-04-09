import { BlockHeaderProps } from "../../types";

export default function BlockHeader({ icon: Icon, title, subtitle }: BlockHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
      <div className="w-8 h-8 rounded-lg bg-[#154734]/8 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#154734]" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-900">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
