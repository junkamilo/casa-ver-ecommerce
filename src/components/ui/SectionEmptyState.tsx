interface SectionEmptyStateProps {
  message?: string;
}

const SectionEmptyState = ({
  message = "Pronto agregaremos nuevos productos.",
}: SectionEmptyStateProps) => {
  return (
    <div className="flex items-center justify-center py-10 sm:py-14">
      <p className="italic text-sm sm:text-base text-[#C19A6B]/70 text-center">
        {message}
      </p>
    </div>
  );
};

export default SectionEmptyState;
