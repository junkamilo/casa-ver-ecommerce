"use client";

import { SearchField } from "./SearchField";
import { useSearchQueryParam } from "./useSearchQueryParam";

interface CatalogListingSearchProps {
  placeholder: string;
  ariaLabel?: string;
}

export function CatalogListingSearch({
  placeholder,
  ariaLabel,
}: CatalogListingSearchProps) {
  const { value, onChange, onClear } = useSearchQueryParam();

  return (
    <div className="mt-6 mb-2 sm:mt-8 sm:mb-4 w-full">
      <SearchField
        value={value}
        onChange={onChange}
        onClear={onClear}
        placeholder={placeholder}
        ariaLabel={ariaLabel ?? placeholder}
      />
    </div>
  );
}
