interface SectionDividerProps {
  title: string;
  subtitle?: string;
  live?: boolean;
}

export function SectionDivider({ title, subtitle, live }: SectionDividerProps) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <div className="shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</h2>
          {live && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              EN VIVO
            </span>
          )}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}
