import type { InjectionKey } from "vue";
import type { CheckboxColor, CheckboxSize } from "../Checkbox/Checkbox.types";

export interface CheckboxGroupContextValue {
  name: string;
  value: string[];
  onToggle: (value: string, checked: boolean) => void;
  disabled: boolean;
  size: CheckboxSize;
  color: CheckboxColor;
}

export const CheckboxGroupContextKey: InjectionKey<CheckboxGroupContextValue> =
  Symbol("CheckboxGroupContext");
