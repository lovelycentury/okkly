import type { SelectOption } from "../../components/Select/Select.types";

export interface City extends SelectOption {
  region: string;
}

export const SELECT_CITIES: City[] = [
  { value: "paris", label: "Paris", region: "Europe" },
  { value: "tokyo", label: "Tokyo", region: "Asia" },
  { value: "kyiv", label: "Kyiv", region: "Europe" },
];
