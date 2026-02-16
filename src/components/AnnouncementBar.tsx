const AnnouncementBar = () => {
  const text = "Envíos a todo Colombia   ✦   Actitud y Comodidad en cada Movimiento   ✦   ";

  return (
    <div className="w-full bg-primary overflow-hidden py-1.5 sm:py-2">
      <div className="scrolling-text flex whitespace-nowrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="text-[10px] sm:text-xs tracking-wider text-primary-foreground/80 mx-2 sm:mx-4">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnouncementBar;
