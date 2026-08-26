"use client";

import { useState, useEffect } from "react";
import { searchCatalogCities } from "@/modules/shipping/presentation/admin-shipping.api-client";
import type { CatalogCityDTO } from "@/modules/shipping/contracts/shipping.dto";

export default function CityAutocomplete({
  value,
  onChange,
}: {
  value: CatalogCityDTO | null;
  onChange: (city: CatalogCityDTO | null) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CatalogCityDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      return;
    }
    
    let active = true;
    const fetchCities = async () => {
      setLoading(true);
      try {
        const data = await searchCatalogCities(query);
        if (active) setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(fetchCities, 300);
    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#154734] focus:border-[#154734]"
        placeholder="Buscar ciudad..."
        value={value ? `${value.name} (${value.department.name})` : query}
        onChange={(e) => {
          if (value) onChange(null);
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {loading && <div className="absolute right-3 top-3 text-xs text-gray-400">Buscando...</div>}
      
      {isOpen && results.length > 0 && !value && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((city) => (
            <li
              key={city.id}
              className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
              onClick={() => {
                onChange(city);
                setIsOpen(false);
                setQuery("");
              }}
            >
              <div className="font-medium text-gray-900">{city.name}</div>
              <div className="text-gray-500 text-xs">{city.department.name}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
