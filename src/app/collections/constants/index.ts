export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevancia" },
  { value: "name-asc",  label: "Nombre A → Z" },
  { value: "name-desc", label: "Nombre Z → A" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
