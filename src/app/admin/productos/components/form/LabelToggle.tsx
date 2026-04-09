import { LabelToggleProps } from "../../types";

export default function LabelToggle({
  active,
  onToggle,
  icon: Icon,
  label,
  description,
  activeColor,
  activeBg,
  activeBorder,
  infoText,
}: LabelToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center justify-between gap-3 w-full rounded-xl border-2 px-4 py-3 transition-all duration-200 text-left ${
        active
          ? `${activeBorder} ${activeBg}`
          : "border-gray-200 bg-gray-50 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${active ? activeBg : "bg-gray-100"}`}>
          <Icon className={`w-4 h-4 ${active ? activeColor : "text-gray-400"}`} />
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-bold uppercase tracking-wide ${active ? activeColor : "text-gray-500"}`}>
            {label}
          </p>
          <p className="text-[10px] text-gray-400 truncate">
            {active && infoText ? infoText : description}
          </p>
        </div>
      </div>
      <div
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
          active ? "bg-current" : "bg-gray-300"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
            active ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
    </button>
  );
}
