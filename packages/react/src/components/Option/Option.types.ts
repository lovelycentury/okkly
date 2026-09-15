import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from "react";

export interface OptionScopeProps {
  /**
   * BEM block the option parts inside this scope use, e.g. `"okkly-select"`.
   *
   * @default undefined
   * @type {string}
   */
  block: string;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface OptionRowProps extends LiHTMLAttributes<HTMLLIElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
}

export interface OptionPartProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
}

export interface OptionCheckProps extends OptionPartProps {
  /**
   * Whether the tick is drawn. `false` still reserves nothing — the element is
   * simply not rendered — so pass the row's `selected` state straight through.
   *
   * @default true
   * @type {boolean}
   */
  checked?: boolean;
}

export interface HighlightMatchProps {
  /**
   * The full option text.
   *
   * @default undefined
   * @type {string}
   */
  text: string;
  /**
   * What the user typed — usually Autocomplete's `inputValue`, handed to
   * `renderOption` in its `state`.
   *
   * @default undefined
   * @type {string}
   */
  query?: string;
  /**
   * Class Name. Applied to the emphasised run.
   *
   * @default undefined
   * @type {string}
   */
  className?: string;
}
