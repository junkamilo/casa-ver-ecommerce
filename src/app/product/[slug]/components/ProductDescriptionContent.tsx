import { parseDescriptionBullets } from "../utils/description";

interface Props {
  description?: string | null;
  className?: string;
}

export default function ProductDescriptionContent({ description, className = "" }: Props) {
  if (!description?.trim()) {
    return (
      <p className={`leading-relaxed text-gray-400 italic ${className}`}>
        Sin descripción disponible.
      </p>
    );
  }

  const bullets = parseDescriptionBullets(description);

  if (bullets.length <= 1) {
    return <p className={`leading-relaxed ${className}`}>{bullets[0]}</p>;
  }

  return (
    <ul className={`space-y-2.5 text-sm ${className}`}>
      {bullets.map((line, index) => (
        <li key={`${index}-${line.slice(0, 24)}`} className="flex items-start gap-2.5">
          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#C19A6B] shrink-0" aria-hidden />
          <span className="leading-relaxed">{line}</span>
        </li>
      ))}
    </ul>
  );
}
