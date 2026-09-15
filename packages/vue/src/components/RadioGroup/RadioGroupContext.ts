import type { InjectionKey } from "vue";
import type { RadioColor, RadioSize } from "../Radio/Radio.types";

export interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onSelect: (value: string) => void;
  disabled: boolean;
  size: RadioSize;
  color: RadioColor;
}

export const RadioGroupContextKey: InjectionKey<RadioGroupContextValue> =
  Symbol("RadioGroupContext");
