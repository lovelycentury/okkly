import type { AutocompleteOption } from "../../components/Autocomplete/Autocomplete.types";

export interface City extends AutocompleteOption {
  region: string;
}

export const AUTOCOMPLETE_CITIES: City[] = [
  { value: "paris", label: "Paris", region: "Europe" },
  { value: "tokyo", label: "Tokyo", region: "Asia" },
];
