import type { HTMLAttributes, ReactNode } from "react";

export type AlertSeverity = "success" | "info" | "warning" | "danger" | "dante";
export type AlertVariant = "standard" | "outlined" | "filled";

/**
 * Props follow MUI's Alert API (https://mui.com/material-ui/api/alert/) as closely as
 * this design allows: `severity`/`variant`/`title`/`children`/`onClose`/`icon`/`action`
 * match name-for-name. Deliberate gaps: no `sx`/`classes`, `variant` uses
 * `"standard"|"outlined"|"filled"` (soft surface / outline / tinted fill — MUI's
 * `"standard"` maps to our raised surface). Adds `"dante"` severity for announcements.
 */
export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * Semantic tone — drives icon and accent colours.
   *
   * @default "info"
   * @type {AlertSeverity}
   */
  severity?: AlertSeverity;
  /**
   * Surface treatment.
   *
   * @default "standard"
   * @type {AlertVariant}
   */
  variant?: AlertVariant;
  /**
   * Bold headline above the message.
   *
   * @default undefined
   * @type {ReactNode}
   */
  title?: ReactNode;
  /**
   * Body message.
   *
   * @default undefined
   * @type {ReactNode}
   */
  children?: ReactNode;
  /**
   * When set, renders a dismiss control.
   *
   * @default undefined
   * @type {() => void}
   */
  onClose?: () => void;
  /**
   * Override the built-in severity icon.
   *
   * @default undefined
   * @type {ReactNode | false}
   */
  icon?: ReactNode | false;
  /**
   * Trailing action slot (e.g. undo button).
   *
   * @default undefined
   * @type {ReactNode}
   */
  action?: ReactNode;
}
