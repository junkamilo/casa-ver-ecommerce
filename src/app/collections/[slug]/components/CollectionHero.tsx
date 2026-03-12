"use client";

interface CollectionHeroProps {
  title: string;
  description?: string | null;
  imageUrl?: string;
}

export default function CollectionHero({ title }: CollectionHeroProps) {
  return (
    <>
      <style>{`
        @keyframes shimmer-slide {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-strip {
          background: linear-gradient(
            90deg,
            #154734 0%,
            #1d6349 20%,
            #C19A6B 50%,
            #1d6349 80%,
            #154734 100%
          );
          background-size: 250% 100%;
          animation: shimmer-slide 6s ease-in-out infinite;
        }
        .hero-title {
          font-family: Georgia, 'Times New Roman', serif;
          text-shadow: 0 2px 12px rgba(0,0,0,0.25);
          letter-spacing: 0.25em;
        }
      `}</style>

      <div className="hero-strip w-full h-24 sm:h-28 flex items-center justify-center rounded-2xl sm:rounded-3xl shadow-[0_8px_32px_-8px_rgba(21,71,52,0.45)] overflow-hidden">
        <h1 className="hero-title text-white font-semibold uppercase text-2xl sm:text-3xl lg:text-4xl">
          {title}
        </h1>
      </div>
    </>
  );
}
