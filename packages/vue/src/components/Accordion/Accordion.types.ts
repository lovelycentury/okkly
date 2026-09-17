/**
 * Props follow MUI's Accordion API (https://mui.com/material-ui/api/accordion/)
 * closely, mirroring `@okkly/react`'s `<Accordion>` name-for-name:
 * `disabled` matches name-for-name. Deliberate gaps carried over from React:
 * composition uses `AccordionSummary` / `AccordionDetails` sub-components
 * (no `items` array), and there's no `AccordionActions` slot in v1.
 *
 * Vue-forced difference: the controlled `expanded` + `onChange` pair becomes
 * an unnamed `defineModel<boolean>()`. `defaultExpanded` stays a real prop —
 * it seeds the model only while it is unbound, read in a computed fallback
 * rather than written into the model on mount. The click event `onChange`
 * also carried is dropped, matching `Rating`/`Checkbox`/`Switch` — nothing
 * here needs it. `children` becomes the default slot, holding
 * `AccordionSummary` and `AccordionDetails`. `className` is dropped — a
 * consumer's `class` merges onto the root automatically.
 */
export interface AccordionProps {
  /**
   * Initial expanded state (uncontrolled).
   *
   * @default false
   */
  defaultExpanded?: boolean;
  /**
   * Disabled.
   *
   * @default false
   */
  disabled?: boolean;
}
