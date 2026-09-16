/**
 * Props mirror `@okkly/react`'s `<OptionScope>` name-for-name. Vue-forced
 * difference: `children` becomes the default slot.
 */
export interface OptionScopeProps {
  /**
   * BEM block the option parts inside this scope use, e.g. `"okkly-select"`.
   *
   * @default undefined
   */
  block: string;
}

/**
 * Props mirror `@okkly/react`'s `<OptionCheck>` name-for-name.
 */
export interface OptionCheckProps {
  /**
   * Whether the tick is drawn. `false` still reserves nothing — the element is
   * simply not rendered — so pass the row's `selected` state straight through.
   *
   * @default true
   */
  checked?: boolean;
}

/**
 * Props mirror `@okkly/react`'s `<HighlightMatch>` name-for-name.
 */
export interface HighlightMatchProps {
  /**
   * The full option text.
   *
   * @default undefined
   */
  text: string;
  /**
   * What the user typed — usually Autocomplete's `inputValue`, handed to a
   * custom `#option` slot in its scope.
   *
   * @default undefined
   */
  query?: string;
}
