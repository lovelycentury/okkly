import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode, SyntheticEvent } from "react";

export interface AccordionContextValue {
  expanded: boolean;
  disabled?: boolean;
  toggle: (event: SyntheticEvent) => void;
}

/**
 * Props follow MUI's Accordion API (https://mui.com/material-ui/api/accordion/)
 * closely: `expanded`/`defaultExpanded`/`onChange`/`disabled` match
 * name-for-name. Deliberate gaps: composition uses `AccordionSummary` /
 * `AccordionDetails` subcomponents (no `items` array), and there's no
 * `AccordionActions` slot in v1.
 */
export interface AccordionProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children" | "onChange"
> {
  /**
   * Controlled expanded state.
   *
   * @default undefined
   * @type {boolean}
   */
  expanded?: boolean;
  /**
   * Initial expanded state (uncontrolled).
   *
   * @default false
   * @type {boolean}
   */
  defaultExpanded?: boolean;
  /**
   * Fires when expanded state changes.
   *
   * @default undefined
   * @type {(event: SyntheticEvent, expanded: boolean) => void}
   */
  onChange?: (event: SyntheticEvent, expanded: boolean) => void;
  /**
   * Disabled.
   *
   * @default false
   * @type {boolean}
   */
  disabled?: boolean;
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}

export interface AccordionSummaryProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  /**
   * Summary title/content.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
  /**
   * Custom expand icon; defaults to a chevron.
   *
   * @default undefined
   * @type {ReactNode}
   */
  expandIcon?: ReactNode;
}

export interface AccordionDetailsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Children.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children: ReactNode;
}
