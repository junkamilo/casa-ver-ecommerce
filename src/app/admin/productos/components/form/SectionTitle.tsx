export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-bold text-[#154734] border-l-4 border-[#C19A6B] pl-3 uppercase tracking-wide">
      {children}
    </h3>
  );
}
