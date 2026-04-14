interface CollectionHeroProps {
  title: string;
  description?: string | null;
  imageUrl?: string;
}

export default function CollectionHero({ title }: CollectionHeroProps) {
  return (
    <div
      className="w-full h-24 sm:h-28 flex items-center justify-center rounded-2xl sm:rounded-3xl shadow-[0_8px_32px_-8px_rgba(21,71,52,0.45)] overflow-hidden"
      style={{ background: "#154734" }}
    >
      <h1
        className="text-white font-semibold uppercase text-2xl sm:text-3xl lg:text-4xl"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", letterSpacing: "0.25em", textShadow: "0 2px 12px rgba(0,0,0,0.25)" }}
      >
        {title}
      </h1>
    </div>
  );
}
