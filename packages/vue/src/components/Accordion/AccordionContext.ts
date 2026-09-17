import { inject, type InjectionKey } from "vue";

export interface AccordionContextValue {
  expanded: boolean;
  disabled: boolean;
  toggle: () => void;
}

export const AccordionContextKey: InjectionKey<AccordionContextValue> = Symbol("AccordionContext");

export function useAccordionContext(component: string): AccordionContextValue {
  const context = inject(AccordionContextKey);
  if (!context) throw new Error(`${component} must be used within Accordion`);
  return context;
}
